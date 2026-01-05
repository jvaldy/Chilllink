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
}
