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

/**
 * ChannelController
 * -----------------
 * Gestion des channels au sein d’un workspace.
 *
 * Responsabilités :
 * - Lister les channels d’un workspace
 * - Créer un channel
 * - Afficher un channel
 * - Modifier un channel
 * - Supprimer un channel et ses messages
 *
 * Sécurité :
 * - Authentification JWT obligatoire
 * - Seul le propriétaire du workspace peut gérer ses channels
 */
#[Route('/api/workspaces/{workspaceId}/channels')]
#[OA\Tag(name: 'Channels')]
final class ChannelController extends AbstractController
{
    /**
     * LISTER LES CHANNELS D’UN WORKSPACE
     * --------------------------------
     */
    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/workspaces/{workspaceId}/channels',
        summary: 'Lister les channels d’un workspace',
        security: [['bearerAuth' => []]]
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

        if ($workspace->getOwner()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        return $this->json(
            $workspace->getChannels(),
            200,
            [],
            ['groups' => 'channel:list']
        );
    }

    /**
     * CRÉER UN CHANNEL
     * ----------------
     */
    #[Route('', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Post(
        path: '/api/workspaces/{workspaceId}/channels',
        summary: 'Créer un channel dans un workspace',
        security: [['bearerAuth' => []]]
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

        if (!$name || !is_string($name)) {
            return $this->json(['error' => 'Invalid name'], 400);
        }

        $channel = new Channel();
        $channel->setName($name);
        $channel->setWorkspace($workspace);

        $em->persist($channel);
        $em->flush();

        return $this->json($channel, 201, [], ['groups' => 'channel:item']);
    }

    /**
     * AFFICHER UN CHANNEL
     * ------------------
     */
    #[Route('/{id}', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/workspaces/{workspaceId}/channels/{id}',
        summary: 'Afficher un channel',
        security: [['bearerAuth' => []]]
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

        $channel = $workspace
            ->getChannels()
            ->filter(fn (Channel $c) => $c->getId() === $id)
            ->first();

        if (!$channel) {
            return $this->json(['error' => 'Channel not found'], 404);
        }

        return $this->json($channel, 200, [], ['groups' => 'channel:item']);
    }

    /**
     * MODIFIER UN CHANNEL
     * ------------------
     */
    #[Route('/{id}', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Patch(
        path: '/api/workspaces/{workspaceId}/channels/{id}',
        summary: 'Modifier un channel',
        security: [['bearerAuth' => []]]
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

    /**
     * SUPPRIMER UN CHANNEL
     * -------------------
     */
    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Delete(
        path: '/api/workspaces/{workspaceId}/channels/{id}',
        summary: 'Supprimer un channel et ses messages',
        security: [['bearerAuth' => []]]
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

        foreach ($channel->getMessages() as $message) {
            $em->remove($message);
        }

        $em->remove($channel);
        $em->flush();

        return $this->json(null, 204);
    }
}
