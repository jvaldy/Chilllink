<?php

namespace App\Tests\Controller;

use Doctrine\ORM\EntityManagerInterface;

// Le endpoint de debug est utile pour diagnostiquer la transmission
// du header Authorization entre client, proxy et application.
class DebugAuthHeaderControllerTest extends ApiWebTestCase
{
    // Endpoint de debug: verifie que le snapshot des headers est bien retourne.
    public function testDebugAuthHeaderEndpointReturnsHeaderSnapshot(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $user = $this->createUser($em, $this->uniqueEmail('debug_header'));
        $jwt = $this->issueJwt($client, $user);

        // On envoie un vrai JWT pour verifier le payload debug
        // sans etre bloque par une erreur "Invalid JWT Token".
        $client->request('GET', '/api/_debug/auth/header', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $jwt,
        ]);
        $this->assertResponseIsSuccessful();
        $json = json_decode((string) $client->getResponse()->getContent(), true);

        $this->assertIsArray($json);
        $this->assertArrayHasKey('headers->get(Authorization)', $json);
        $this->assertArrayHasKey('server HTTP_AUTHORIZATION', $json);
    }
}

