<?php

namespace App\Tests\Controller;

use Doctrine\ORM\EntityManagerInterface;

// Les tests profil valident la creation paresseuse du profil utilisateur.
class ProfileControllerTest extends ApiWebTestCase
{
    // Si aucun profil n'existe, l'endpoint retourne 204.
    public function testGetProfileReturnsNoContentWhenMissing(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $user = $this->createUser($em, $this->uniqueEmail('profile_empty'));
        $this->loginApiUser($client, $user);

        // Aucun PATCH n'a ete fait, donc aucun UserProfile associe en base.
        $client->request('GET', '/api/profile');
        $this->assertResponseStatusCodeSame(204);
    }

    // PATCH cree/met a jour le profil puis GET retourne les memes donnees.
    public function testPatchProfileCreatesAndReturnsProfile(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $user = $this->createUser($em, $this->uniqueEmail('profile_update'));
        $jwt = $this->issueJwt($client, $user);

        // Le PATCH doit creer le profil si inexistant puis persister les champs fournis.
        $client->request('PATCH', '/api/profile', [], [], $this->authHeaders($jwt, true), json_encode([
            'firstName' => 'Ada',
            'lastName' => 'Lovelace',
            'city' => 'Paris',
            'country' => 'France',
            'bio' => 'Engineer',
            'birthDate' => '1991-12-09',
        ]));
        $this->assertResponseIsSuccessful();
        $json = $this->responseJson($client);
        $this->assertSame('Ada', $json['firstName'] ?? null);
        $this->assertSame('Lovelace', $json['lastName'] ?? null);
        $this->assertSame('Paris', $json['city'] ?? null);

        // Verification de coherence: un GET juste apres doit renvoyer les memes valeurs.
        $client->request('GET', '/api/profile', [], [], $this->authHeaders($jwt));
        $this->assertResponseIsSuccessful();
        $json = $this->responseJson($client);
        $this->assertSame('Ada', $json['firstName'] ?? null);
    }
}

