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
    public function list(
        int $workspaceId,
        WorkspaceRepository $workspaceRepo
    ): JsonResponse {
        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

        
        $this->denyAccessUnlessGranted('WORKSPACE_VIEW', $workspace);

        return $this->json(
            $workspace->getChannels(),
            200,
            [],
            ['groups' => 'channel:list']
        );
    }

    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
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

        
        $this->denyAccessUnlessGranted('WORKSPACE_OWNER', $workspace);

        $data = json_decode($request->getContent(), true);
        if (!isset($data['name']) || !is_string($data['name'])) {
            return $this->json(['error' => 'Invalid name'], 400);
        }

        $channel = new Channel();
        $channel->setName($data['name']);
        $channel->setWorkspace($workspace);

        
        $channel->getMembers()->add($user);

        $em->persist($channel);
        $em->flush();

        return $this->json($channel, 201, [], ['groups' => 'channel:item']);
    }

    #[Route('/{id}', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function show(
        int $workspaceId,
        int $id,
        WorkspaceRepository $workspaceRepo,
        ChannelRepository $channelRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $workspace = $workspaceRepo->find($workspaceId);
        if (!$workspace) {
            return $this->json(['error' => 'Workspace not found'], 404);
        }

       
        $this->denyAccessUnlessGranted('WORKSPACE_VIEW', $workspace);

        $channel = $channelRepo->findOneInWorkspace($id, $workspaceId);
        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        
        if (!$channel->getMembers()->contains($user)) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        return $this->json($channel, 200, [], ['groups' => 'channel:item']);
    }

    #[Route('/{id}', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
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
