<?php

namespace App\Controller;

use App\Dto\AddWorkspaceMemberRequest;
use App\Entity\User;
use App\Repository\WorkspaceRepository;
use App\Service\WorkspaceMemberManager;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/workspaces')]
#[OA\Tag(name: 'Workspace Members')]
final class WorkspaceMemberController extends AbstractController
{
    /**
     * LISTE DES MEMBRES D’UN WORKSPACE (membre workspace requis)
     */
    
    #[Route('/{id}/members', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/workspaces/{id}/members',
        summary: "LISTE DES MEMBRES D'UN WORKSPACE (membre workspace requis)",
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 11
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function listMembers(int $id, WorkspaceRepository $repo): JsonResponse
    {
        $workspace = $repo->find($id);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        $this->denyAccessUnlessGranted('WORKSPACE_VIEW', $workspace);

        $members = [];
        foreach ($workspace->getMembers() as $member) {
            $members[] = [
                'id' => $member->getId(),
                'email' => $member->getEmail(),
            ];
        }

        return $this->json($members, 200);
    }

    /**
     * AJOUTER UN MEMBRE (owner uniquement) — ajout par email
     */
    #[Route('/{id}/members', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        path: '/api/workspaces/{id}/members',
        summary: "AJOUTER UN MEMBRE (owner uniquement) — ajout par email",
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 11
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'user@test.com'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 400, description: 'Bad request'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function addMember(
        int $id,
        Request $request,
        WorkspaceRepository $repo,
        WorkspaceMemberManager $manager,
        ValidatorInterface $validator
    ): JsonResponse {
        $workspace = $repo->find($id);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        $this->denyAccessUnlessGranted('WORKSPACE_OWNER', $workspace);

        $data = json_decode($request->getContent(), true) ?? [];

        if (!isset($data['email']) || !is_string($data['email'])) {
            return $this->json(['error' => 'Missing email'], 400);
        }

        $dto = new AddWorkspaceMemberRequest();
        $dto->email = $data['email'];

        $errors = $validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json(['error' => (string) $errors], 422);
        }

        $result = $manager->addMemberByEmail($workspace, $dto->email);

        return $this->json([
            'workspaceId' => $workspace->getId(),
            ...$result,
        ], 200);
    }

    /**
     * RETIRER UN MEMBRE (owner uniquement)
     */
    #[Route('/{id}/members/{userId}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Delete(
        path: '/api/workspaces/{id}/members/{userId}',
        summary: "RETIRER UN MEMBRE (owner uniquement)",
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 11),
            new OA\Parameter(name: 'userId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 4),
        ],
        responses: [
            new OA\Response(response: 204, description: 'No Content'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function removeMember(
        int $id,
        int $userId,
        WorkspaceRepository $repo,
        WorkspaceMemberManager $manager
    ): JsonResponse {
        $workspace = $repo->find($id);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        $this->denyAccessUnlessGranted('WORKSPACE_OWNER', $workspace);

        $manager->removeMember($workspace, $userId);

        return $this->json(null, 204);
    }
}
