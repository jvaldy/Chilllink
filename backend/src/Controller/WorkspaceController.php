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

/**
 * WorkspaceController
 * -------------------
 * Contrôleur responsable de la gestion des workspaces.
 *
 * Responsabilités :
 * - Lister les workspaces de l’utilisateur connecté
 * - Créer un workspace
 * - Afficher un workspace
 * - Modifier un workspace
 * - Supprimer un workspace et ses dépendances (channels, messages)
 *
 * Sécurité :
 * - Toutes les routes nécessitent une authentification JWT
 * - Les opérations sensibles sont limitées au propriétaire du workspace
 */
#[Route('/api/workspaces')]
#[OA\Tag(name: 'Workspaces')]
final class WorkspaceController extends AbstractController
{
    /**
     * LISTE DES WORKSPACES DE L’UTILISATEUR CONNECTÉ
     * ---------------------------------------------
     * Retourne uniquement les workspaces dont l’utilisateur est propriétaire.
     */
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
        /** @var User $user Utilisateur actuellement authentifié */
        $user = $this->getUser();

        // Récupération des workspaces dont l’utilisateur est propriétaire
        $workspaces = $repo->findBy(['owner' => $user]);

        // Sérialisation contrôlée via le groupe "workspace:list"
        return $this->json(
            $workspaces,
            200,
            [],
            ['groups' => 'workspace:list']
        );
    }

    /**
     * CRÉATION D’UN WORKSPACE
     * ----------------------
     * Crée un nouveau workspace et l’associe à l’utilisateur connecté.
     */
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
                description: 'Workspace créé'
            ),
            new OA\Response(response: 400, description: 'Données invalides'),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        // Décodage du JSON envoyé par le client
        $data = json_decode($request->getContent(), true);

        // Création et hydratation de l’entité Workspace
        $workspace = new Workspace();
        $workspace->setName($data['name']);
        $workspace->setOwner($user);

        // Persistance en base de données
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
     * Accessible uniquement par le propriétaire du workspace.
     */
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

        // Vérification manuelle des droits (propriétaire uniquement)
        if ($workspace->getOwner() !== $this->getUser()) {
            return $this->json(['error' => 'Forbidden'], 403);
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
     * Permet de modifier le nom du workspace.
     */
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
        )
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

        // Validation minimale des données
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

    /**
     * SUPPRESSION D’UN WORKSPACE
     * --------------------------
     * Supprime :
     * - le workspace
     * - ses channels
     * - tous les messages associés
     *
     * ⚠️ La suppression est volontairement explicite
     * pour garder un contrôle total sur le cycle de vie des entités.
     */
    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Delete(
        path: '/api/workspaces/{id}',
        summary: 'Supprimer un workspace et toutes ses dépendances',
        security: [['bearerAuth' => []]]
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

        // Suppression manuelle des dépendances (messages → channels → workspace)
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
