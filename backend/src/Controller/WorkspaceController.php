<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Workspace;
use App\Repository\WorkspaceRepository;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/workspaces')]
#[OA\Tag(name: 'Workspaces')]
final class WorkspaceController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/workspaces',
        summary: 'Liste les workspaces de l’utilisateur connecté',
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des workspaces',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'name', type: 'string', example: 'Mon workspace'),
                        ]
                    )
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function list(WorkspaceRepository $repo): JsonResponse
    {
        $user = $this->getUser();

        $workspaces = $repo->findBy(['owner' => $user]);

        return $this->json(
            $workspaces,
            200,
            [],
            ['groups' => 'workspace:list']
        );
    }

    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        path: '/api/workspaces',
        summary: 'Créer un nouveau workspace',
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Mon workspace'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Workspace créé',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 1),
                        new OA\Property(property: 'name', type: 'string', example: 'Mon workspace'),
                    ]
                )
            ),
            new OA\Response(response: 400, description: 'Données invalides'),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $workspace = new Workspace();
        $workspace->setName($data['name']);
        $workspace->setOwner($user);

        $em->persist($workspace);
        $em->flush();

        return $this->json(
            $workspace,
            201,
            [],
            ['groups' => 'workspace:item']
        );
    }




    #[Route('/{id}', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/workspaces/{id}',
        summary: 'Afficher un workspace',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Workspace trouvé'),
            new OA\Response(response: 403, description: 'Accès refusé'),
            new OA\Response(response: 404, description: 'Workspace introuvable'),
        ]
    )]
    public function show(int $id, WorkspaceRepository $repo): JsonResponse
    {
        $workspace = $repo->find($id);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        if ($workspace->getOwner() !== $this->getUser()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        return $this->json($workspace, 200, [], ['groups' => 'workspace:item']);
    }

    #[Route('/{id}', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Patch(
        path: '/api/workspaces/{id}',
        summary: 'Modifier un workspace',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Nouveau nom')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Workspace mis à jour'),
            new OA\Response(response: 400, description: 'Données invalides'),
            new OA\Response(response: 403, description: 'Accès refusé'),
            new OA\Response(response: 404, description: 'Workspace introuvable'),
        ]
    )]
    public function update(
        int $id,
        Request $request,
        WorkspaceRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $workspace = $repo->find($id);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        if ($workspace->getOwner() !== $this->getUser()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name']) && is_string($data['name'])) {
            $workspace->setName($data['name']);
        } else {
            return $this->json(['error' => 'Invalid name'], 400);
        }

        $em->flush();

        return $this->json(
            $workspace,
            200,
            [],
            ['groups' => 'workspace:item']
        );
    }

    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Delete(
        path: '/api/workspaces/{id}',
        summary: 'Supprimer un workspace et toutes ses dépendances',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 204, description: 'Workspace supprimé'),
            new OA\Response(response: 403, description: 'Accès refusé'),
            new OA\Response(response: 404, description: 'Workspace introuvable'),
        ]
    )]
    public function delete(
        int $id,
        WorkspaceRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $workspace = $repo->find($id);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        if ($workspace->getOwner() !== $this->getUser()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        // supprimer les messages
        foreach ($workspace->getChannels() as $channel) {
            foreach ($channel->getMessages() as $message) {
                $em->remove($message);
            }
            $em->remove($channel);
        }

        $em->remove($workspace);
        $em->flush();

        return $this->json(null, 204);
    }

    







}
