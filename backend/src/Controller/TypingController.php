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
#[OA\Tag(name: 'Typing')]
class TypingController extends AbstractController
{
    public function __construct(
        private TypingPublisher $typingPublisher
    ) {}

    #[Route('/{id}/typing', name: 'channel_typing', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        path: '/api/channels/{id}/typing',
        summary: 'Publier un evenement typing',
        description: 'Publie un evenement typing pour l utilisateur courant sur un channel.',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                description: 'Identifiant du channel',
                schema: new OA\Schema(type: 'integer', example: 2)
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Evenement typing publie',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'ok'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Authentification requise'),
            new OA\Response(response: 403, description: 'Acces refuse'),
            new OA\Response(response: 404, description: 'Channel introuvable'),
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
