<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

final class DebugAuthHeaderController extends AbstractController
{
    #[Route('/api/_debug/auth/header', name: 'debug_auth_header', methods: ['GET', 'POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        return $this->json([
            'headers->get(Authorization)' => $request->headers->get('Authorization'),
            'server HTTP_AUTHORIZATION' => $request->server->get('HTTP_AUTHORIZATION'),
            'all_request_headers' => $request->headers->all(),
        ]);
    }
}
