<?php

namespace App\Controller;

use App\Entity\Channel;
use App\Entity\User;
use App\Repository\ChannelRepository;
use App\Repository\WorkspaceRepository;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/workspaces/{workspaceId}/channels')]
#[OA\Tag(name: 'Channels')]
final class ChannelController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/workspaces/{workspaceId}/channels',
        summary: 'Lister les channels du workspace',
        description: 'Retourne les channels du workspace avec un indicateur isMember pour l utilisateur courant.',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'workspaceId',
                in: 'path',
                required: true,
                description: 'Identifiant du workspace',
                schema: new OA\Schema(type: 'integer', example: 11)
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des channels',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 2),
                            new OA\Property(property: 'name', type: 'string', example: 'general'),
                            new OA\Property(property: 'isMember', type: 'boolean', example: true),
                        ]
                    )
                )
            ),
            new OA\Response(response: 401, description: 'Authentification requise'),
            new OA\Response(response: 403, description: 'Acces refuse'),
            new OA\Response(response: 404, description: 'Workspace introuvable'),
        ]
    )]
    public function list(
        int $workspaceId,
        WorkspaceRepository $workspaceRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        $this->denyAccessUnlessGranted('WORKSPACE_VIEW', $workspace);

        $channels = $workspace->getChannels();

        $payload = [];
        foreach ($channels as $channel) {
            $payload[] = [
                'id' => $channel->getId(),
                'name' => $channel->getName(),
                'isMember' => $channel->isMember($user),
            ];
        }

        return $this->json($payload, 200);
    }

    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        path: '/api/workspaces/{workspaceId}/channels',
        summary: 'Creer un channel',
        description: 'Cree un channel dans le workspace. Seul le owner du workspace est autorise.',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'workspaceId',
                in: 'path',
                required: true,
                description: 'Identifiant du workspace',
                schema: new OA\Schema(type: 'integer', example: 11)
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'general'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Channel cree'),
            new OA\Response(response: 400, description: 'Payload invalide'),
            new OA\Response(response: 401, description: 'Authentification requise'),
            new OA\Response(response: 403, description: 'Acces refuse'),
            new OA\Response(response: 404, description: 'Workspace introuvable'),
        ]
    )]
    public function create(
        int $workspaceId,
        Request $request,
        WorkspaceRepository $workspaceRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        // ✅ owner uniquement
        $this->denyAccessUnlessGranted('WORKSPACE_OWNER', $workspace);

        $data = json_decode($request->getContent(), true);
        if (!isset($data['name']) || !is_string($data['name'])) {
            return $this->json(['error' => 'Invalid name'], 400);
        }

        $channel = new Channel();
        $channel->setName($data['name']);
        $channel->setWorkspace($workspace);

        // ✅ owner membre du channel (mais pas d’auto-sync avec les autres membres)
        $channel->addMember($user);

        $em->persist($channel);
        $em->flush();

        return $this->json($channel, 201, [], ['groups' => 'channel:item']);
    }

    #[Route('/{id}', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/workspaces/{workspaceId}/channels/{id}',
        summary: 'Afficher un channel',
        description: 'Retourne le detail d un channel si l utilisateur a acces au workspace et au channel.',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'workspaceId', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 11)),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 2)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Channel trouve'),
            new OA\Response(response: 401, description: 'Authentification requise'),
            new OA\Response(response: 403, description: 'Acces refuse'),
            new OA\Response(response: 404, description: 'Workspace ou channel introuvable'),
        ]
    )]
    public function show(
        int $workspaceId,
        int $id,
        WorkspaceRepository $workspaceRepo,
        ChannelRepository $channelRepo
    ): JsonResponse {
        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        // ✅ prérequis : membre workspace
        $this->denyAccessUnlessGranted('WORKSPACE_VIEW', $workspace);

        $channel = $channelRepo->findOneInWorkspace($id, $workspaceId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        // ✅ channel verrouillé : voter
        $this->denyAccessUnlessGranted('CHANNEL_VIEW', $channel);

        return $this->json($channel, 200, [], ['groups' => 'channel:item']);
    }

    #[Route('/{id}', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Patch(
        path: '/api/workspaces/{workspaceId}/channels/{id}',
        summary: 'Modifier un channel',
        description: 'Modifie le nom d un channel. Seul le owner du workspace est autorise.',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'workspaceId', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 11)),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 2)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'support'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Channel modifie'),
            new OA\Response(response: 400, description: 'Payload invalide'),
            new OA\Response(response: 401, description: 'Authentification requise'),
            new OA\Response(response: 403, description: 'Acces refuse'),
            new OA\Response(response: 404, description: 'Workspace ou channel introuvable'),
        ]
    )]
    public function update(
        int $workspaceId,
        int $id,
        Request $request,
        WorkspaceRepository $workspaceRepo,
        ChannelRepository $channelRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        $this->denyAccessUnlessGranted('WORKSPACE_OWNER', $workspace);

        $channel = $channelRepo->findOneInWorkspace($id, $workspaceId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['name']) || !is_string($data['name'])) {
            return $this->json(['error' => 'Invalid name'], 400);
        }

        $channel->setName($data['name']);
        $em->flush();

        return $this->json($channel, 200, [], ['groups' => 'channel:item']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Delete(
        path: '/api/workspaces/{workspaceId}/channels/{id}',
        summary: 'Supprimer un channel',
        description: 'Supprime un channel et ses messages. Seul le owner du workspace est autorise.',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'workspaceId', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 11)),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 2)),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Channel supprime'),
            new OA\Response(response: 401, description: 'Authentification requise'),
            new OA\Response(response: 403, description: 'Acces refuse'),
            new OA\Response(response: 404, description: 'Workspace ou channel introuvable'),
        ]
    )]
    public function delete(
        int $workspaceId,
        int $id,
        WorkspaceRepository $workspaceRepo,
        ChannelRepository $channelRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        $this->denyAccessUnlessGranted('WORKSPACE_OWNER', $workspace);

        $channel = $channelRepo->findOneInWorkspace($id, $workspaceId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        foreach ($channel->getMessages() as $message) {
            $em->remove($message);
        }

        $em->remove($channel);
        $em->flush();

        return $this->json(null, 204);
    }
}
