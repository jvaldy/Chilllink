<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\ChannelRepository;
use App\Service\TypingPublisher;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/channels')]
class TypingController extends AbstractController
{
    public function __construct(
        private TypingPublisher $typingPublisher
    ) {}

    #[Route('/{id}/typing', name: 'channel_typing', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        summary: 'Notify that current user is typing in a channel',
        responses: [
            new OA\Response(response: 200, description: 'Typing event published'),
            new OA\Response(response: 401, description: 'Unauthorized'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Channel not found'),
        ]
    )]
    public function typing(int $id, ChannelRepository $channelRepo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $channel = $channelRepo->find($id);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        $this->denyAccessUnlessGranted('CHANNEL_VIEW', $channel);

        $this->typingPublisher->publish($id, [
            'userId' => $user->getId(),
            'username' => $user->getEmail(), 
        ]);

        return $this->json(['status' => 'ok'], 200);
    }
}
