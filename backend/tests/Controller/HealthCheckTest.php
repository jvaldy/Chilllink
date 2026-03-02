<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

// Test simple de securite: une route API protegee ne doit pas etre accessible en anonyme.
class HealthCheckTest extends WebTestCase
{
    // Sans authentification, l'acces API protege doit renvoyer 401.
    public function testApiReturns401WhenNotAuthenticated(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/workspaces/1/channels');
        $this->assertResponseStatusCodeSame(401);
    }
}

