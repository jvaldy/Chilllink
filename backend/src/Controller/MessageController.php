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
    public function __construct(private HubInterface $hub) {}

    // POST
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
                    new OA\Property(property: 'content', type: 'string', example: 'Hello world!')
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
                'createdAt' => $message->getCreatedAt()->format(DATE_ATOM)
            ])
        );
        $this->hub->publish($update);

        return $this->json([
            'id' => $message->getId(),
            'content' => $message->getContent(),
            'author' => $message->getAuthor()->getEmail(),
            'createdAt' => $message->getCreatedAt()->format(\DateTime::ATOM),
        ], 201);
    }

    // PATCH
    #[Route('/{id}', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Patch(
        path: '/api/channels/{channelId}/messages/{id}',
        summary: 'Modifier un message',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'content', type: 'string', example: 'Texte mis à jour')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Message modifié'),
            new OA\Response(response: 400, description: 'Données invalides'),
            new OA\Response(response: 403, description: 'Accès refusé'),
            new OA\Response(response: 404, description: 'Message introuvable'),
        ]
    )]
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

        return $this->json([
            'id' => $message->getId(),
            'content' => $message->getContent(),
            'author' => $message->getAuthor()->getEmail(),
            'createdAt' => $message->getCreatedAt()->format(\DateTime::ATOM)
        ], 200);
    }

    // GET single
    #[Route('/{id}', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/channels/{channelId}/messages/{id}',
        summary: 'Afficher un message',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Message retourné',
                content: new OA\JsonContent(
                    type: "object",
                    properties: [
                        new OA\Property(property: "id", type: "integer", example: 12),
                        new OA\Property(property: "content", type: "string", example: "Salut!"),
                        new OA\Property(property: "author", type: "string", example: "user@example.com"),
                        new OA\Property(property: "createdAt", type: "string", example: "2025-12-31T12:00:00+00:00")
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Message introuvable'),
        ]
    )]
    public function show(int $channelId, int $id, EntityManagerInterface $em): JsonResponse
    {
        $message = $em->getRepository(Message::class)->find($id);
        if (!$message || $message->getChannel()->getId() !== $channelId) {
            return $this->json(['error' => 'Message not found'], 404);
        }

        return $this->json([
            'id' => $message->getId(),
            'content' => $message->getContent(),
            'author' => $message->getAuthor()->getEmail(),
            'createdAt' => $message->getCreatedAt()->format(\DateTime::ATOM)
        ], 200);
    }

    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/channels/{channelId}/messages',
        summary: 'Liste des messages d’un channel',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'limit', in: 'query', required: false, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des messages',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "id", type: "integer"),
                            new OA\Property(property: "content", type: "string"),
                            new OA\Property(property: "author", type: "string"),
                            new OA\Property(property: "createdAt", type: "string")
                        ]
                    )
                )
            )
        ]
    )]
    public function list(int $channelId, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $repo = $em->getRepository(Message::class);

        // pagination (mais on test avant sans offset)
        $page  = max(1, (int) $request->query->get('page', 1));
        $limit = max(1, (int) $request->query->get('limit', 50));
        $offset = ($page - 1) * $limit;

        $qb = $repo->createQueryBuilder('m')
            ->innerJoin('m.channel', 'c')
            ->andWhere('c.id = :channelId')
            ->setParameter('channelId', $channelId)
            ->orderBy('m.createdAt', 'ASC');

        // applique pagination seulement si page > 1
        if ($page > 1) {
            $qb->setFirstResult($offset);
        }
        $qb->setMaxResults($limit);

        $messages = $qb->getQuery()->getResult();

        $output = array_map(function (Message $message) {
            return [
                'id' => $message->getId(),
                'content' => $message->getContent(),
                'author' => $message->getAuthor()->getEmail(),
                'createdAt' => $message->getCreatedAt()->format(\DateTime::ATOM),
            ];
        }, $messages);

        return $this->json($output, 200);
    }


    // DELETE
    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Delete(
        path: '/api/channels/{channelId}/messages/{id}',
        summary: 'Supprimer un message',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 204, description: 'Message supprimé'),
            new OA\Response(response: 403, description: 'Accès refusé'),
            new OA\Response(response: 404, description: 'Message introuvable')
        ]
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
