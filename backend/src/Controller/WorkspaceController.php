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
    /**
     * LISTE DES WORKSPACES DE L’UTILISATEUR CONNECTÉ
     * ---------------------------------------------
     * Retourne les workspaces dont l’utilisateur est MEMBRE.
     */
    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/workspaces',
        summary: 'Liste les workspaces dont l’utilisateur est membre',
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des workspaces',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(
                        type: 'object',
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
        /** @var User $user */
        $user = $this->getUser();

        $qb = $repo->createQueryBuilder('w')
            ->join('w.members', 'm')
            ->where('m = :user')
            ->setParameter('user', $user);

        return $this->json(
            $qb->getQuery()->getResult(),
            200,
            [],
            ['groups' => 'workspace:list']
        );
    }

    /**
     * CRÉATION D’UN WORKSPACE
     * ----------------------
     * Le créateur devient owner ET membre.
     */
    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        path: '/api/workspaces',
        summary: 'Créer un workspace (le créateur devient owner + member)',
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
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 1),
                        new OA\Property(property: 'name', type: 'string', example: 'Mon workspace'),
                        new OA\Property(property: 'createdAt', type: 'string', example: '2026-01-11T12:00:00+00:00'),
                    ]
                )
            ),
            new OA\Response(response: 400, description: 'Données invalides'),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || !is_string($data['name'])) {
            return $this->json(['error' => 'Invalid name'], 400);
        }

        $workspace = new Workspace();
        $workspace->setName($data['name']);
        $workspace->setOwner($user);
        $workspace->addMember($user); // owner = member

        $em->persist($workspace);
        $em->flush();

        return $this->json(
            $workspace,
            201,
            [],
            ['groups' => 'workspace:item']
        );
    }

    /**
     * AFFICHER UN WORKSPACE
     * --------------------
     * Accessible uniquement si l’utilisateur est membre.
     */
    #[Route('/{id}', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/workspaces/{id}',
        summary: 'Afficher un workspace (membre uniquement)',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Workspace trouvé'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Accès refusé (non membre)'),
            new OA\Response(response: 404, description: 'Workspace introuvable'),
        ]
    )]
    public function show(int $id, WorkspaceRepository $repo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $workspace = $repo->find($id);

        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        if (!$workspace->getMembers()->contains($user)) {
            $this->denyAccessUnlessGranted('WORKSPACE_VIEW', $workspace);
        }

        return $this->json(
            $workspace,
            200,
            [],
            ['groups' => 'workspace:item']
        );
    }

    /**
     * MODIFICATION D’UN WORKSPACE
     * ---------------------------
     * Réservée au propriétaire.
     */
    #[Route('/{id}', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Patch(
        path: '/api/workspaces/{id}',
        summary: 'Modifier un workspace (owner uniquement)',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Nouveau nom')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Workspace modifié'),
            new OA\Response(response: 400, description: 'Données invalides'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Accès refusé (non owner)'),
            new OA\Response(response: 404, description: 'Workspace introuvable'),
        ]
    )]
    public function update(
        int $id,
        Request $request,
        WorkspaceRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $workspace = $repo->find($id);

        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        if ($workspace->getOwner() !== $user) {
            $this->denyAccessUnlessGranted('WORKSPACE_MANAGE_MEMBERS', $workspace);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || !is_string($data['name'])) {
            return $this->json(['error' => 'Invalid name'], 400);
        }

        $workspace->setName($data['name']);
        $em->flush();

        return $this->json(
            $workspace,
            200,
            [],
            ['groups' => 'workspace:item']
        );
    }

    /**
     * SUPPRESSION D’UN WORKSPACE
     * --------------------------
     * Réservée au propriétaire.
     */
    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Delete(
        path: '/api/workspaces/{id}',
        summary: 'Supprimer un workspace (owner uniquement)',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        responses: [
            new OA\Response(response: 204, description: 'Workspace supprimé'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Accès refusé (non owner)'),
            new OA\Response(response: 404, description: 'Workspace introuvable'),
        ]
    )]
    public function delete(
        int $id,
        WorkspaceRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $workspace = $repo->find($id);

        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        if ($workspace->getOwner() !== $user) {
            $this->denyAccessUnlessGranted('WORKSPACE_MANAGE_MEMBERS', $workspace);
        }

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
