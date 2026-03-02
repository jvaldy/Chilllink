<?php

namespace App\Tests\Controller;

use Doctrine\ORM\EntityManagerInterface;

// Ces tests couvrent la gestion des membres de channel:
// - ajout idempotent
// - refus si utilisateur hors workspace
// - suppression par l'owner du workspace
class ChannelMemberControllerTest extends ApiWebTestCase
{
    // L'owner peut ajouter un membre puis obtenir "already_member" au second appel.
    public function testOwnerCanAddMemberToChannel(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('cm_owner'));
        $member = $this->createUser($em, $this->uniqueEmail('cm_member'));
        $workspace = $this->createWorkspace($em, $owner, 'Channel Membership');
        $workspace->addMember($member);
        $em->flush();

        // Le channel demarre avec l'owner uniquement.
        $channel = $this->createChannel($em, $workspace, 'general', [$owner]);

        $jwt = $this->issueJwt($client, $owner);
        $uri = sprintf(
            '/api/workspaces/%d/channels/%d/members',
            $workspace->getId(),
            $channel->getId()
        );
        $client->request('POST', $uri, [], [], $this->authHeaders($jwt, true), json_encode(['email' => $member->getEmail()]));
        $this->assertResponseIsSuccessful();
        $json = $this->responseJson($client);
        $this->assertSame('member_added', $json['status'] ?? null);
        $client->request('POST', $uri, [], [], $this->authHeaders($jwt, true), json_encode(['email' => $member->getEmail()]));
        $this->assertResponseIsSuccessful();
        $json = $this->responseJson($client);
        $this->assertSame('already_member', $json['status'] ?? null);
    }

    // Un utilisateur hors workspace ne peut pas etre ajoute au channel.
    public function testOwnerCannotAddUserOutsideWorkspace(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('cm_owner2'));
        $outsider = $this->createUser($em, $this->uniqueEmail('cm_outsider2'));
        $workspace = $this->createWorkspace($em, $owner, 'Channel Membership 2');
        $channel = $this->createChannel($em, $workspace, 'general', [$owner]);
        $jwt = $this->issueJwt($client, $owner);

        // L'API doit rejeter l'ajout car l'utilisateur cible n'est pas membre du workspace.
        $client->request(
            'POST',
            sprintf('/api/workspaces/%d/channels/%d/members', $workspace->getId(), $channel->getId()),
            [],
            [],
            $this->authHeaders($jwt, true),
            json_encode(['email' => $outsider->getEmail()])
        );
        $this->assertResponseStatusCodeSame(400);
    }

    // L'owner peut retirer un membre deja present du channel.
    public function testOwnerCanRemoveChannelMember(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('cm_owner3'));
        $member = $this->createUser($em, $this->uniqueEmail('cm_member3'));
        $workspace = $this->createWorkspace($em, $owner, 'Channel Membership 3');
        $workspace->addMember($member);
        $em->flush();
        $channel = $this->createChannel($em, $workspace, 'general', [$owner, $member]);
        $jwt = $this->issueJwt($client, $owner);

        // Suppression directe d'un membre existant.
        $client->request(
            'DELETE',
            sprintf(
                '/api/workspaces/%d/channels/%d/members/%d',
                $workspace->getId(),
                $channel->getId(),
                $member->getId()
            ),
            [],
            [],
            $this->authHeaders($jwt)
        );
        $this->assertResponseStatusCodeSame(204);
    }
}

