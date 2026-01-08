<?php

namespace App\Controller;

use App\Entity\Message;
use App\Entity\User;
use App\Repository\ChannelRepository;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * MessageController
 * -----------------
 * Contrôleur responsable de la gestion des messages dans les channels.
 *
 * Responsabilités :
 * - Envoi de messages
 * - Modification / suppression de messages
 * - Consultation d’un message
 * - Liste paginée des messages d’un channel
 * - Publication en temps réel via Mercure
 *
 * Sécurité :
 * - Toutes les routes nécessitent une authentification JWT
 * - Seul l’auteur d’un message peut le modifier ou le supprimer
 */
#[Route('/api/channels/{channelId}/messages')]
#[OA\Tag(name: 'Messages')]
final class MessageController extends AbstractController
{
    /**
     * Hub Mercure injecté via le constructeur
     *
     * Permet la publication d’événements temps réel
     * (nouveaux messages, futures notifications, etc.)
     */
    public function __construct(private HubInterface $hub) {}

    /**
     * ENVOYER UN MESSAGE (POST)
     * ------------------------
     * Crée un message dans un channel donné et le diffuse en temps réel.
     */
    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        path: '/api/channels/{channelId}/messages',
        summary: 'Envoyer un message dans un channel',
        security: [['bearerAuth' => []]]
    )]
    public function send(
        int $channelId,
        Request $request,
        ChannelRepository $channelRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        /** @var User $user Utilisateur authentifié */
        $user = $this->getUser();

        // Vérification de l’existence du channel
        $channel = $channelRepo->find($channelId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        // Lecture et validation des données envoyées
        $data = json_decode($request->getContent(), true);
        $content = $data['content'] ?? null;

        if (!$content) {
            return $this->json(['error' => 'content required'], 400);
        }

        // Création et hydratation du message
        $message = new Message();
        $message->setContent($content);
        $message->setAuthor($user);
        $message->setChannel($channel);

        // Sauvegarde en base
        $em->persist($message);
        $em->flush();

        /**
         * Publication Mercure
         * -------------------
         * Diffuse le message à tous les clients abonnés au topic du channel
         */
        $update = new Update(
            "channel/{$channel->getId()}",
            json_encode([
                'id'        => $message->getId(),
                'content'   => $message->getContent(),
                'author'    => $user->getEmail(),
                'createdAt' => $message->getCreatedAt()->format(DATE_ATOM),
            ])
        );

        $this->hub->publish($update);

        // Réponse API
        return $this->json([
            'id'        => $message->getId(),
            'content'   => $message->getContent(),
            'author'    => $message->getAuthor()->getEmail(),
            'createdAt' => $message->getCreatedAt()->format(\DateTime::ATOM),
        ], 201);
    }

    /**
     * MODIFIER UN MESSAGE (PATCH)
     * ---------------------------
     * Seul l’auteur du message est autorisé à le modifier.
     */
    #[Route('/{id}', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Patch(
        path: '/api/channels/{channelId}/messages/{id}',
        summary: 'Modifier un message',
        security: [['bearerAuth' => []]]
    )]
    public function update(
        int $channelId,
        int $id,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $message = $em->getRepository(Message::class)->find($id);

        // Vérifie l’existence du message et son appartenance au channel
        if (!$message || $message->getChannel()->getId() !== $channelId) {
            return $this->json(['error' => 'Message not found'], 404);
        }

        // Vérification des droits (auteur uniquement)
        if ($message->getAuthor() !== $this->getUser()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        // Validation des données
        $data = json_decode($request->getContent(), true);
        if (!isset($data['content']) || !is_string($data['content'])) {
            return $this->json(['error' => 'Invalid content'], 400);
        }

        $message->setContent($data['content']);
        $em->flush();

        return $this->json([
            'id'        => $message->getId(),
            'content'   => $message->getContent(),
            'author'    => $message->getAuthor()->getEmail(),
            'createdAt' => $message->getCreatedAt()->format(\DateTime::ATOM),
        ], 200);
    }

    /**
     * AFFICHER UN MESSAGE (GET)
     * -------------------------
     * Retourne un message précis dans un channel donné.
     */
    #[Route('/{id}', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/channels/{channelId}/messages/{id}',
        summary: 'Afficher un message',
        security: [['bearerAuth' => []]]
    )]
    public function show(int $channelId, int $id, EntityManagerInterface $em): JsonResponse
    {
        $message = $em->getRepository(Message::class)->find($id);

        if (!$message || $message->getChannel()->getId() !== $channelId) {
            return $this->json(['error' => 'Message not found'], 404);
        }

        return $this->json([
            'id'        => $message->getId(),
            'content'   => $message->getContent(),
            'author'    => $message->getAuthor()->getEmail(),
            'createdAt' => $message->getCreatedAt()->format(\DateTime::ATOM),
        ], 200);
    }

    /**
     * LISTE DES MESSAGES D’UN CHANNEL (GET)
     * ------------------------------------
     * Supporte une pagination simple (page / limit).
     */
    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/channels/{channelId}/messages',
        summary: 'Liste des messages d’un channel',
        security: [['bearerAuth' => []]]
    )]
    public function list(int $channelId, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $repo = $em->getRepository(Message::class);

        // Paramètres de pagination
        $page   = max(1, (int) $request->query->get('page', 1));
        $limit  = max(1, (int) $request->query->get('limit', 50));
        $offset = ($page - 1) * $limit;

        // Construction de la requête Doctrine
        $qb = $repo->createQueryBuilder('m')
            ->innerJoin('m.channel', 'c')
            ->andWhere('c.id = :channelId')
            ->setParameter('channelId', $channelId)
            ->orderBy('m.createdAt', 'ASC');

        // Application de la pagination
        if ($page > 1) {
            $qb->setFirstResult($offset);
        }
        $qb->setMaxResults($limit);

        $messages = $qb->getQuery()->getResult();

        // Transformation des entités en tableau JSON
        $output = array_map(function (Message $message) {
            return [
                'id'        => $message->getId(),
                'content'   => $message->getContent(),
                'author'    => $message->getAuthor()->getEmail(),
                'createdAt' => $message->getCreatedAt()->format(\DateTime::ATOM),
            ];
        }, $messages);

        return $this->json($output, 200);
    }

    /**
     * SUPPRIMER UN MESSAGE (DELETE)
     * -----------------------------
     * Seul l’auteur du message peut le supprimer.
     */
    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Delete(
        path: '/api/channels/{channelId}/messages/{id}',
        summary: 'Supprimer un message',
        security: [['bearerAuth' => []]]
    )]
    public function delete(int $channelId, int $id, EntityManagerInterface $em): JsonResponse
    {
        $message = $em->getRepository(Message::class)->find($id);

        if (!$message || $message->getChannel()->getId() !== $channelId) {
            return $this->json(['error' => 'Message not found'], 404);
        }

        if ($message->getAuthor() !== $this->getUser()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        $em->remove($message);
        $em->flush();

        return $this->json(null, 204);
    }
}
