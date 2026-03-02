<?php

namespace App\Tests\Controller;

use Doctrine\ORM\EntityManagerInterface;

// Tests d'acces et de comportement autour du CRUD channel cote workspace.
class ChannelControllerTest extends ApiWebTestCase
{
    // Seul l'owner du workspace peut creer un channel.
    public function testCreateChannel(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('channel_owner'));
        $workspace = $this->createWorkspace($em, $owner, 'Workspace Channel');
        $this->loginApiUser($client, $owner);

        // Le payload minimal attendu par l'endpoint create est le nom du channel.
        $client->request(
            'POST',
            '/api/workspaces/' . $workspace->getId() . '/channels',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['name' => 'general'])
        );
        $this->assertResponseStatusCodeSame(201);
    }

    // Un membre non-owner ne peut pas creer de channel.
    public function testNonOwnerCannotCreateChannel(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('channel_owner2'));
        $member = $this->createUser($em, $this->uniqueEmail('channel_member2'));
        $workspace = $this->createWorkspace($em, $owner, 'Workspace Channel 2');
        $workspace->addMember($member);
        $em->flush();

        // Un membre simple peut consulter, mais pas creer.
        $this->loginApiUser($client, $member);
        $client->request(
            'POST',
            '/api/workspaces/' . $workspace->getId() . '/channels',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['name' => 'forbidden'])
        );
        $this->assertResponseStatusCodeSame(403);
    }

    // La liste des channels expose le flag isMember pour l'utilisateur courant.
    public function testListChannelsShowsMembershipFlag(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('channel_owner3'));
        $member = $this->createUser($em, $this->uniqueEmail('channel_member3'));
        $workspace = $this->createWorkspace($em, $owner, 'Workspace Channel 3');
        $workspace->addMember($member);
        $em->flush();
        $this->createChannel($em, $workspace, 'general', [$owner, $member]);

        // Sur la route list, on passe par JWT pour refléter le mode stateless de l'API.
        $jwt = $this->issueJwt($client, $member);
        $client->request(
            'GET',
            '/api/workspaces/' . $workspace->getId() . '/channels',
            [],
            [],
            $this->authHeaders($jwt)
        );
        $this->assertResponseIsSuccessful();
        $json = $this->responseJson($client);
        $this->assertNotEmpty($json);
        $this->assertTrue((bool) ($json[0]['isMember'] ?? false));
    }
}

