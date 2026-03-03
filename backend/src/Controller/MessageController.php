<?php

namespace App\Controller;

use App\Entity\Channel;
use App\Entity\Message;
use App\Entity\User;
use App\Repository\ChannelRepository;
use App\Service\MessageNormalizer;
use App\Service\MessagePublisher;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/channels/{channelId}/messages')]
#[OA\Tag(name: 'Messages')]
final class MessageController extends AbstractController
{
    public function __construct(
        private MessagePublisher $messagePublisher
    ) {}

    private function getChannelOrDeny(int $channelId, ChannelRepository $channelRepo): Channel
    {
        $channel = $channelRepo->find($channelId);
        if (!$channel) {
            throw $this->createNotFoundException('Channel not found');
        }

        // ✅ vérifie : membre workspace + membre channel
        $this->denyAccessUnlessGranted('CHANNEL_VIEW', $channel);

        return $channel;
    }

    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        path: '/api/channels/{channelId}/messages',
        summary: 'Envoyer un message',
        description: 'Cree un message dans le channel.',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 2)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['content'],
                properties: [
                    new OA\Property(property: 'content', type: 'string', example: 'Bonjour tout le monde'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Message cree'),
            new OA\Response(response: 400, description: 'Payload invalide'),
            new OA\Response(response: 401, description: 'Authentification requise'),
            new OA\Response(response: 403, description: 'Acces refuse'),
            new OA\Response(response: 404, description: 'Channel introuvable'),
        ]
    )]
    public function send(
        int $channelId,
        Request $request,
        ChannelRepository $channelRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $channel = $this->getChannelOrDeny($channelId, $channelRepo);

        $data = json_decode($request->getContent(), true);
        if (!isset($data['content']) || !is_string($data['content'])) {
            return $this->json(['error' => 'Invalid content'], 400);
        }

        $message = new Message();
        $message->setContent($data['content']);
        $message->setAuthor($user);
        $message->setChannel($channel);

        $em->persist($message);
        $em->flush();

        $this->messagePublisher->publish($message);

        return $this->json(MessageNormalizer::normalize($message), 201);
    }

    #[Route('/{id}', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Patch(
        path: '/api/channels/{channelId}/messages/{id}',
        summary: 'Modifier un message',
        description: 'Modifie un message. Seul son auteur est autorise.',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 2)),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 15)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['content'],
                properties: [
                    new OA\Property(property: 'content', type: 'string', example: 'Message edite'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Message modifie'),
            new OA\Response(response: 400, description: 'Payload invalide'),
            new OA\Response(response: 401, description: 'Authentification requise'),
            new OA\Response(response: 403, description: 'Acces refuse'),
            new OA\Response(response: 404, description: 'Message ou channel introuvable'),
        ]
    )]
    public function update(
        int $channelId,
        int $id,
        Request $request,
        ChannelRepository $channelRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->getChannelOrDeny($channelId, $channelRepo);

        $message = $em->getRepository(Message::class)->find($id);
        if (!$message || $message->getChannel()->getId() !== $channelId) {
            return $this->json(['error' => 'Message not found'], 404);
        }

        if ($message->getAuthor() !== $this->getUser()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['content']) || !is_string($data['content'])) {
            return $this->json(['error' => 'Invalid content'], 400);
        }

        $message->setContent($data['content']);
        $em->flush();

        return $this->json(MessageNormalizer::normalize($message), 200);
    }

    #[Route('/{id}', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/channels/{channelId}/messages/{id}',
        summary: 'Afficher un message',
        description: 'Retourne le detail d un message du channel.',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 2)),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 15)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Message trouve'),
            new OA\Response(response: 401, description: 'Authentification requise'),
            new OA\Response(response: 403, description: 'Acces refuse'),
            new OA\Response(response: 404, description: 'Message ou channel introuvable'),
        ]
    )]
    public function show(
        int $channelId,
        int $id,
        ChannelRepository $channelRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->getChannelOrDeny($channelId, $channelRepo);

        $message = $em->getRepository(Message::class)->find($id);
        if (!$message || $message->getChannel()->getId() !== $channelId) {
            return $this->json(['error' => 'Message not found'], 404);
        }

        return $this->json(MessageNormalizer::normalize($message), 200);
    }

    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/channels/{channelId}/messages',
        summary: 'Lister les messages d un channel',
        description: 'Retourne les messages pagines du channel.',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 2)),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', example: 1)),
            new OA\Parameter(name: 'limit', in: 'query', required: false, schema: new OA\Schema(type: 'integer', example: 50)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Liste des messages'),
            new OA\Response(response: 401, description: 'Authentification requise'),
            new OA\Response(response: 403, description: 'Acces refuse'),
            new OA\Response(response: 404, description: 'Channel introuvable'),
        ]
    )]
    public function list(
        int $channelId,
        Request $request,
        ChannelRepository $channelRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->getChannelOrDeny($channelId, $channelRepo);

        $page   = max(1, (int) $request->query->get('page', 1));
        $limit  = max(1, (int) $request->query->get('limit', 50));
        $offset = ($page - 1) * $limit;

        $messages = $em->getRepository(Message::class)
            ->createQueryBuilder('m')
            ->innerJoin('m.channel', 'c')
            ->andWhere('c.id = :channelId')
            ->setParameter('channelId', $channelId)
            ->orderBy('m.createdAt', 'ASC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return $this->json(
            array_map(fn (Message $m) => MessageNormalizer::normalize($m), $messages),
            200
        );
    }

    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Delete(
        path: '/api/channels/{channelId}/messages/{id}',
        summary: 'Supprimer un message',
        description: 'Supprime un message. Seul son auteur est autorise.',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 2)),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 15)),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Message supprime'),
            new OA\Response(response: 401, description: 'Authentification requise'),
            new OA\Response(response: 403, description: 'Acces refuse'),
            new OA\Response(response: 404, description: 'Message ou channel introuvable'),
        ]
    )]
    public function delete(
        int $channelId,
        int $id,
        ChannelRepository $channelRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->getChannelOrDeny($channelId, $channelRepo);

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
