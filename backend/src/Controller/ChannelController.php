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
}
