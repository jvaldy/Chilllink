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

#[Route('/api/channels/{channelId}/messages')]
#[OA\Tag(name: 'Messages')]
final class MessageController extends AbstractController
{
    public function __construct(
        private HubInterface $hub
    ) {}

    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        path: '/api/channels/{channelId}/messages',
        summary: 'Envoyer un message dans un channel',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['content'],
                properties: [
                    new OA\Property(property: 'content', type: 'string', example: 'Hello world!'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Message créé'),
            new OA\Response(response: 400, description: 'Données invalides'),
            new OA\Response(response: 401, description: 'Non authentifié'),
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

        $channel = $channelRepo->find($channelId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $content = $data['content'] ?? null;

        if (!$content) {
            return $this->json(['error' => 'content required'], 400);
        }

        $message = new Message();
        $message->setContent($content);
        $message->setAuthor($user);
        $message->setChannel($channel);

        $em->persist($message);
        $em->flush();

        $update = new Update(
            "channel/{$channel->getId()}",
            json_encode([
                'id' => $message->getId(),
                'content' => $message->getContent(),
                'author' => $user->getEmail(),
                'createdAt' => $message->getCreatedAt()->format(DATE_ATOM),
            ])
        );

        $this->hub->publish($update);

        return $this->json([
            'id' => $message->getId(),
            'content' => $message->getContent(),
            'author' => $message->getAuthor()->getEmail(),
            'createdAt' => $message->getCreatedAt()->format(\DateTime::ATOM),
            'channel' => [
                'id' => $message->getChannel()->getId(),
                'name' => $message->getChannel()->getName(),
                'workspace' => [
                    'id' => $message->getChannel()->getWorkspace()->getId(),
                    'name' => $message->getChannel()->getWorkspace()->getName(),
                ]
            ]
        ], 201);


    }
}
