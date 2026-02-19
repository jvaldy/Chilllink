<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\ChannelRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/workspaces/{workspaceId}/channels/{channelId}/members')]
#[OA\Tag(name: 'Channel Members')]
final class ChannelMemberController extends AbstractController
{
    /**
     * LISTE DES MEMBRES D’UN CHANNEL
     * - prérequis : être membre du workspace
     * - et avoir accès au channel (CHANNEL_VIEW) OU être owner workspace
     */
    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function list(
        int $workspaceId,
        int $channelId,
        WorkspaceRepository $workspaceRepo,
        ChannelRepository $channelRepo
    ): JsonResponse {
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

        // accès aux membres : owner OU membre du channel (via voter)
        if (!$this->isGranted('WORKSPACE_OWNER', $workspace)) {
            $this->denyAccessUnlessGranted('CHANNEL_VIEW', $channel);
        }

        return $this->json(
            $channel->getMembers(),
            200,
            [],
            ['groups' => 'channel:item'] // tes Users sont déjà dans workspace:item/channel:item via Groups(User.email)
        );
    }

    /**
     * AJOUTER UN MEMBRE DANS UN CHANNEL (owner workspace uniquement)
     * Body recommandé : { "email": "user@test.com" }
     */
    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function add(
        int $workspaceId,
        int $channelId,
        Request $request,
        WorkspaceRepository $workspaceRepo,
        ChannelRepository $channelRepo,
        UserRepository $userRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        // owner only
        $this->denyAccessUnlessGranted('WORKSPACE_OWNER', $workspace);

        $channel = $channelRepo->findOneInWorkspace($channelId, $workspaceId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $email = $data['email'] ?? null;

        if (!\is_string($email) || trim($email) === '') {
            return $this->json(['error' => 'Invalid email'], 400);
        }

        $userToAdd = $userRepo->findOneBy(['email' => $email]);
        if (!$userToAdd) {
            return $this->json(['error' => 'User not found'], 404);
        }

        // doit déjà être membre workspace
        if (!$workspace->getMembers()->contains($userToAdd)) {
            return $this->json(['error' => 'User is not a workspace member'], 400);
        }

        if ($channel->isMember($userToAdd)) {
            return $this->json(['status' => 'already_member'], 200);
        }

        $channel->addMember($userToAdd);
        $em->flush();

        return $this->json([
            'status' => 'member_added',
            'workspaceId' => $workspaceId,
            'channelId' => $channelId,
            'userId' => $userToAdd->getId(),
        ], 200);
    }

    /**
     * RETIRER UN MEMBRE DU CHANNEL (owner workspace uniquement)
     */
    #[Route('/{userId}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function remove(
        int $workspaceId,
        int $channelId,
        int $userId,
        WorkspaceRepository $workspaceRepo,
        ChannelRepository $channelRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        // owner only
        $this->denyAccessUnlessGranted('WORKSPACE_OWNER', $workspace);

        $channel = $channelRepo->findOneInWorkspace($channelId, $workspaceId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        /** @var User|null $userToRemove */
        $userToRemove = $em->getRepository(User::class)->find($userId);
        if (!$userToRemove) {
            return $this->json(['error' => 'User not found'], 404);
        }

        // sécurité UX : on évite de retirer l’owner du channel si tu veux garder owner toujours membre
        // (optionnel) : ici je laisse possible. Si tu veux interdire, dis-moi.

        if (!$channel->isMember($userToRemove)) {
            return $this->json(['status' => 'not_member'], 200);
        }

        $channel->removeMember($userToRemove);
        $em->flush();

        return $this->json(null, 204);
    }
}
