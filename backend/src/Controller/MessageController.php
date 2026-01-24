<?php

namespace App\Controller;

use App\Entity\Message;
use App\Entity\User;
use App\Repository\ChannelRepository;
use App\Service\MessagePublisher;
use App\Service\MessageNormalizer;
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

    /**
     * ENVOYER UN MESSAGE
     */
    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function send(
        int $channelId,
        Request $request,
        ChannelRepository $channelRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $channel = $channelRepo->find($channelId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

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

        // 🔥 Publication Mercure (payload normalisé)
        $this->messagePublisher->publish($message);

        return $this->json(
            MessageNormalizer::normalize($message),
            201
        );
    }

    /**
     * MODIFIER UN MESSAGE
     */
    #[Route('/{id}', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function update(
        int $channelId,
        int $id,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
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

        return $this->json(
            MessageNormalizer::normalize($message),
            200
        );
    }

    /**
     * AFFICHER UN MESSAGE
     */
    #[Route('/{id}', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function show(
        int $channelId,
        int $id,
        EntityManagerInterface $em
    ): JsonResponse {
        $message = $em->getRepository(Message::class)->find($id);

        if (!$message || $message->getChannel()->getId() !== $channelId) {
            return $this->json(['error' => 'Message not found'], 404);
        }

        return $this->json(
            MessageNormalizer::normalize($message),
            200
        );
    }

    /**
     * LISTE DES MESSAGES
     */
    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function list(
        int $channelId,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
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
            array_map(
                fn (Message $m) => MessageNormalizer::normalize($m),
                $messages
            ),
            200
        );
    }

    /**
     * SUPPRIMER UN MESSAGE
     */
    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function delete(
        int $channelId,
        int $id,
        EntityManagerInterface $em
    ): JsonResponse {
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
