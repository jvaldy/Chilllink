<?php

namespace App\Tests\Controller;

use Doctrine\ORM\EntityManagerInterface;

// Couverture minimale de l'endpoint typing:
// on teste le controle d'acces et le cas channel introuvable.
class TypingControllerTest extends ApiWebTestCase
{
    // L'endpoint typing est protege par JWT.
    public function testTypingRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/channels/1/typing');
        $this->assertResponseStatusCodeSame(401);
    }

    // Si le channel n'existe pas, l'endpoint retourne 404.
    public function testTypingReturns404ForUnknownChannel(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $user = $this->createUser($em, $this->uniqueEmail('typing_user'));
        $jwt = $this->issueJwt($client, $user);

        // Le but ici est de rester independant de Mercure:
        // on valide uniquement la partie controleur HTTP.
        $client->request('POST', '/api/channels/999999/typing', [], [], $this->authHeaders($jwt));
        $this->assertResponseStatusCodeSame(404);
    }
}

