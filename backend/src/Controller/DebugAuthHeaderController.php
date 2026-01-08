<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

/**
 * DebugAuthHeaderController
 * ------------------------
 * Contrôleur de debug permettant d’inspecter les headers HTTP reçus par l’API.
 *
 * Objectif principal :
 * - Vérifier si le header Authorization est bien transmis
 * - Diagnostiquer les problèmes liés à :
 *   - JWT non reconnu
 *   - Reverse proxy (Docker, Nginx, Traefik)
 *   - CORS
 *   - Headers supprimés ou réécrits
 *
 * ⚠️ IMPORTANT :
 * - Ce contrôleur est STRICTEMENT destiné au développement
 * - Il doit être supprimé ou désactivé en production
 */
final class DebugAuthHeaderController extends AbstractController
{
    /**
     * Endpoint de debug
     * -----------------
     * URL : /api/_debug/auth/header
     * Méthodes : GET, POST
     *
     * Retourne :
     * - Le header Authorization tel que lu par Symfony
     * - La valeur brute côté serveur (PHP)
     * - L’ensemble des headers reçus
     */
    #[Route('/api/_debug/auth/header', name: 'debug_auth_header', methods: ['GET', 'POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        return $this->json([
            /**
             * Accès via l’objet Headers Symfony
             * → méthode recommandée en temps normal
             */
            'headers->get(Authorization)' => $request->headers->get('Authorization'),

            /**
             * Accès via la variable serveur PHP
             * → utile si le header est présent mais non interprété
             */
            'server HTTP_AUTHORIZATION' => $request->server->get('HTTP_AUTHORIZATION'),

            /**
             * Dump complet de tous les headers reçus
             * → permet de repérer les transformations ou suppressions
             */
            'all_request_headers' => $request->headers->all(),
        ]);
    }
}
