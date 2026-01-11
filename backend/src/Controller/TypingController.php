<?php

namespace App\Controller;

use App\Service\TypingPublisher;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
        summary: 'Notify that a user is typing in a channel',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['userId', 'username'],
                properties: [
                    new OA\Property(property: 'userId', type: 'integer', example: 1),
                    new OA\Property(property: 'username', type: 'string', example: 'Username'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Typing event published'
            ),
            new OA\Response(
                response: 400,
                description: 'Invalid payload'
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthorized'
            ),
        ]
    )]
    public function typing(int $id, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['userId'], $data['username'])) {
            return $this->json(
                ['error' => 'Invalid payload'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }

        $this->typingPublisher->publish($id, [
            'userId' => $data['userId'],
            'username' => $data['username'],
        ]);

        return $this->json(['status' => 'ok']);
    }
}
