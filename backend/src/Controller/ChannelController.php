<?php

namespace App\Controller;

use App\Entity\Channel;
use App\Entity\User;
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
    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        path: '/api/workspaces/{workspaceId}/channels',
        summary: 'Créer un channel dans un workspace',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'workspaceId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
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
            new OA\Response(
                response: 201,
                description: 'Channel créé',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 10),
                        new OA\Property(property: 'name', type: 'string', example: 'general'),
                    ]
                )
            ),
            new OA\Response(response: 400, description: 'Données invalides'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Accès refusé'),
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

        if ($workspace->getOwner()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $name = $data['name'] ?? null;

        if (!$name) {
            return $this->json(['error' => 'name required'], 400);
        }

        $channel = new Channel();
        $channel->setName($name);
        $channel->setWorkspace($workspace);

        $em->persist($channel);
        $em->flush();

        return $this->json($channel, 201, [], ['groups' => 'channel:item']);
    }





    #[Route('/{id}', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/workspaces/{workspaceId}/channels/{id}',
        summary: 'Afficher un channel',
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Channel trouvé'),
            new OA\Response(response: 403, description: 'Accès refusé'),
            new OA\Response(response: 404, description: 'Channel introuvable'),
        ]
    )]
    public function show(
        int $workspaceId,
        int $id,
        WorkspaceRepository $workspaceRepo
    ): JsonResponse {
        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        if ($workspace->getOwner() !== $this->getUser()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        $channel = $workspace->getChannels()->filter(fn ($c) => $c->getId() === $id)->first();
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        return $this->json($channel, 200, [], ['groups' => 'channel:item']);
    }




    #[Route('/{id}', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Patch(
        path: '/api/workspaces/{workspaceId}/channels/{id}',
        summary: 'Modifier un channel',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'workspaceId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Nouveau channel')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Channel modifié'),
            new OA\Response(response: 400, description: 'Données invalides'),
            new OA\Response(response: 403, description: 'Accès refusé'),
            new OA\Response(response: 404, description: 'Channel introuvable'),
        ]
    )]
    public function update(
        int $workspaceId,
        int $id,
        Request $request,
        WorkspaceRepository $workspaceRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
        return $this->json(['error' => 'Workspace not found'], 404);
        }

        if ($workspace->getOwner() !== $this->getUser()) {
        return $this->json(['error' => 'Forbidden'], 403);
        }

        $channel = $em->getRepository(Channel::class)->find($id);
        if (!$channel || $channel->getWorkspace()->getId() !== $workspaceId) {
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
        summary: 'Supprimer un channel et ses messages',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'workspaceId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 204, description: 'Channel supprimé'),
            new OA\Response(response: 403, description: 'Accès refusé'),
            new OA\Response(response: 404, description: 'Channel introuvable'),
        ]
    )]
    public function delete(
        int $workspaceId,
        int $id,
        WorkspaceRepository $workspaceRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        if ($workspace->getOwner() !== $this->getUser()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        $channel = $em->getRepository(Channel::class)->find($id);
        if (!$channel || $channel->getWorkspace()->getId() !== $workspaceId) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        // delete messages first
        foreach ($channel->getMessages() as $message) {
            $em->remove($message);
        }

        $em->remove($channel);
        $em->flush();

        return $this->json(null, 204);
    }




}
