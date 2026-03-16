<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

// Endpoint qui retourne l'utilisateur authentifie
#[OA\Tag(name: 'Users')]
#[OA\Get(
    path: '/api/me',
    summary: "Retourne l'utilisateur connecte",
    security: [['bearerAuth' => []]],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Utilisateur connecte',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'id', type: 'integer', example: 1),
                    new OA\Property(property: 'email', type: 'string', example: 'user@email.com'),
                    new OA\Property(
                        property: 'roles',
                        type: 'array',
                        items: new OA\Items(type: 'string'),
                        example: ['ROLE_USER']
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Non authentifie'),
    ]
)]
#[Route(
    path: '/api/me',
    name: 'api_me',
    methods: ['GET']
)]
final class MeController extends AbstractController
{
    // Route protegee par JWT
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function __invoke(): JsonResponse
    {
        // Recupere l'utilisateur courant
        $user = $this->getUser();

        // Verifie le type de l'utilisateur
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        // Retourne les infos minimales
        return $this->json([
            'id'    => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);
    }
}
