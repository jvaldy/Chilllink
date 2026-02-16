<?php

namespace App\Controller;

use App\Dto\AddChannelMemberRequest;
use App\Entity\Channel;
use App\Entity\User;
use App\Repository\ChannelRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Service\ChannelMemberManager;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/workspaces/{workspaceId}/channels/{channelId}/members')]
#[OA\Tag(name: 'Channel Members')]
final class ChannelMemberController extends AbstractController
{
    public function __construct(
        private readonly ChannelMemberManager $manager,
        private readonly ValidatorInterface $validator,
    ) {}

    /**
     * LISTER LES MEMBRES D'UN CHANNEL
     * - prérequis: être membre du workspace
     * - et être membre du channel (car channel verrouillé)
     */
    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/workspaces/{workspaceId}/channels/{channelId}/members',
        summary: "Lister les membres d'un channel (membre workspace + membre channel requis)",
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'workspaceId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 11),
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 8),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function list(
        int $workspaceId,
        int $channelId,
        WorkspaceRepository $workspaceRepo,
        ChannelRepository $channelRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        // membre workspace requis
        $this->denyAccessUnlessGranted('WORKSPACE_VIEW', $workspace);

        $channel = $channelRepo->findOneInWorkspace($channelId, $workspaceId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        // channel verrouillé : membre du channel requis
        if (!$channel->getMembers()->contains($user)) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        return $this->json(
            $channel->getMembers(),
            200,
            [],
            ['groups' => 'workspace:item'] // User.email est déjà dans workspace:item chez toi
        );
    }

    /**
     * AJOUTER UN MEMBRE AU CHANNEL (par email)
     * - owner workspace uniquement
     */
    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        path: '/api/workspaces/{workspaceId}/channels/{channelId}/members',
        summary: "Ajouter un membre au channel (owner workspace) — ajout par email",
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'workspaceId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 11),
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 8),
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
    public function add(
        int $workspaceId,
        int $channelId,
        Request $request,
        WorkspaceRepository $workspaceRepo,
        ChannelRepository $channelRepo
    ): JsonResponse {
        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        // owner uniquement
        $this->denyAccessUnlessGranted('WORKSPACE_OWNER', $workspace);

        $channel = $channelRepo->findOneInWorkspace($channelId, $workspaceId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        $data = json_decode($request->getContent(), true) ?: [];
        $dto = AddChannelMemberRequest::fromArray($data);

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->json(['error' => (string) $violations], 422);
        }

        $addedUser = $this->manager->addMemberByEmail($channel, $dto->email);

        return $this->json([
            'status' => 'channel_member_added',
            'workspaceId' => $workspaceId,
            'channelId' => $channelId,
            'userId' => $addedUser->getId(),
            'email' => $addedUser->getEmail(),
        ], 200);
    }

    /**
     * RETIRER UN MEMBRE DU CHANNEL
     * - owner workspace uniquement
     */
    #[Route('/{userId}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Delete(
        path: '/api/workspaces/{workspaceId}/channels/{channelId}/members/{userId}',
        summary: "Retirer un membre du channel (owner workspace)",
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'workspaceId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 11),
            new OA\Parameter(name: 'channelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 8),
            new OA\Parameter(name: 'userId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 4),
        ],
        responses: [
            new OA\Response(response: 204, description: 'No Content'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function remove(
        int $workspaceId,
        int $channelId,
        int $userId,
        WorkspaceRepository $workspaceRepo,
        ChannelRepository $channelRepo,
        UserRepository $userRepo
    ): JsonResponse {
        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        $this->denyAccessUnlessGranted('WORKSPACE_OWNER', $workspace);

        $channel = $channelRepo->findOneInWorkspace($channelId, $workspaceId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        $user = $userRepo->find($userId);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $this->manager->removeMember($channel, $user);

        return $this->json(null, 204);
    }
}
