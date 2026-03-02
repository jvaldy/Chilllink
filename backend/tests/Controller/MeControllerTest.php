<?php

namespace App\Tests\Controller;

use Doctrine\ORM\EntityManagerInterface;

// Controle des garanties minimales de l'endpoint /api/me.
class MeControllerTest extends ApiWebTestCase
{
    // /api/me est reserve aux utilisateurs authentifies.
    public function testMeRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/me');
        $this->assertResponseStatusCodeSame(401);
    }

    // /api/me retourne les infos de base de l'utilisateur courant.
    public function testMeReturnsAuthenticatedUser(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $user = $this->createUser($em, $this->uniqueEmail('me'));

        // Ce test passe par loginUser pour valider le cas fonctionnel simple en environnement test.
        $this->loginApiUser($client, $user);
        $client->request('GET', '/api/me');
        $this->assertResponseIsSuccessful();
        $json = $this->responseJson($client);

        $this->assertSame($user->getEmail(), $json['email'] ?? null);
        // L'entite User garantit la presence de ROLE_USER dans getRoles().
        $this->assertContains('ROLE_USER', $json['roles'] ?? []);
    }
}

