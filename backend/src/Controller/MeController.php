<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * MeController
 * ------------
 * Endpoint dédié à la récupération de l’utilisateur actuellement authentifié.
 *
 * URL : GET /api/me
 *
 * Responsabilités :
 * - Retourner les informations minimales de l’utilisateur connecté
 * - Vérifier que l’utilisateur est bien authentifié (JWT valide)
 *
 * Cas d’usage typiques :
 * - Initialisation du front après login
 * - Récupération du profil utilisateur
 * - Vérification de session côté client
 *
 * Design choice :
 * - Contrôleur "invokable" (__invoke)
 *   → une seule action, un seul endpoint, lisibilité maximale
 */
#[OA\Tag(name: 'Utilisateur')]
#[OA\Get(
    path: '/api/me',
    summary: 'Retourne l’utilisateur connecté',
    security: [['bearerAuth' => []]],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Utilisateur connecté',
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
        new OA\Response(response: 401, description: 'Non authentifié'),
    ]
)]
#[Route(
    path: '/api/me',
    name: 'api_me',
    methods: ['GET']
)]
final class MeController extends AbstractController
{
    /**
     * Méthode magique __invoke()
     * --------------------------
     * Symfony appelle automatiquement cette méthode
     * lorsqu’un contrôleur ne définit qu’une seule action.
     *
     * Avantages :
     * - Code plus concis
     * - Intention claire : un endpoint = une responsabilité
     */
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function __invoke(): JsonResponse
    {
        /**
         * Récupération de l’utilisateur depuis le Security Token Storage
         * Injecté automatiquement par Symfony via le système de sécurité
         */
        $user = $this->getUser();

        /**
         * Sécurité défensive :
         * - Vérifie que l’objet retourné est bien une instance de User
         * - Protège contre un état incohérent ou une mauvaise configuration
         */
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        /**
         * Réponse JSON volontairement minimale :
         * - id       : identifiant technique
         * - email    : identifiant fonctionnel
         * - roles    : gestion des droits côté front
         *
         * ⚠️ Aucune donnée sensible n’est exposée (mot de passe, tokens, etc.)
         */
        return $this->json([
            'id'    => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);
    }
}
