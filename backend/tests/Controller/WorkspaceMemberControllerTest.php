<?php

namespace App\Tests\Controller;

use Doctrine\ORM\EntityManagerInterface;

// Cette classe couvre les regles d'administration des membres d'un workspace.
class WorkspaceMemberControllerTest extends ApiWebTestCase
{
    // Scenario principal: ajout d'un membre, idempotence, puis suppression.
    public function testOwnerCanAddThenRemoveMember(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('wm_owner'));
        $member = $this->createUser($em, $this->uniqueEmail('wm_member'));
        $workspace = $this->createWorkspace($em, $owner, 'Members Workspace');

        // Appel protege: on recupere un JWT valide avant toute operation.
        $jwt = $this->issueJwt($client, $owner);
        $client->request('POST', '/api/workspaces/' . $workspace->getId() . '/members', [], [], $this->authHeaders($jwt, true), json_encode(['email' => $member->getEmail()]));
        $this->assertResponseIsSuccessful();
        $json = $this->responseJson($client);
        $this->assertSame('member_added', $json['status'] ?? null);
        $client->request('POST', '/api/workspaces/' . $workspace->getId() . '/members', [], [], $this->authHeaders($jwt, true), json_encode(['email' => $member->getEmail()]));
        $this->assertResponseIsSuccessful();
        $json = $this->responseJson($client);
        $this->assertSame('already_member', $json['status'] ?? null);
        $client->request('DELETE', '/api/workspaces/' . $workspace->getId() . '/members/' . $member->getId(), [], [], $this->authHeaders($jwt));
        $this->assertResponseStatusCodeSame(204);
    }

    // Regle metier: l'owner ne peut pas se retirer lui-meme.
    public function testCannotRemoveWorkspaceOwner(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('wm_owner2'));
        $workspace = $this->createWorkspace($em, $owner, 'Owner Workspace');
        $jwt = $this->issueJwt($client, $owner);

        // Cas metier explicite: l'owner ne peut pas etre retire de son propre workspace.
        $client->request('DELETE', '/api/workspaces/' . $workspace->getId() . '/members/' . $owner->getId(), [], [], $this->authHeaders($jwt));
        $this->assertResponseStatusCodeSame(400);
    }

    // Controle d'acces: seul l'owner peut ajouter un membre.
    public function testNonOwnerCannotAddMember(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('wm_owner3'));
        $member = $this->createUser($em, $this->uniqueEmail('wm_member3'));
        $target = $this->createUser($em, $this->uniqueEmail('wm_target3'));
        $workspace = $this->createWorkspace($em, $owner, 'Forbidden Add');
        $workspace->addMember($member);
        $em->flush();

        // Le membre non-owner tente une action reservee a l'owner.
        $jwt = $this->issueJwt($client, $member);
        $client->request('POST', '/api/workspaces/' . $workspace->getId() . '/members', [], [], $this->authHeaders($jwt, true), json_encode(['email' => $target->getEmail()]));
        $this->assertResponseStatusCodeSame(403);
    }
}

