<?php

namespace App\Tests\Controller;

use Doctrine\ORM\EntityManagerInterface;

// Cette suite valide surtout les regles d'autorisation autour des messages:
// - lecture reservee aux membres du channel
// - ecriture/suppression reservees a l'auteur
class MessageControllerTest extends ApiWebTestCase
{
    // Un membre du channel peut lister les messages puis en lire un.
    public function testChannelMemberCanListAndShowMessages(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('msg_owner'));
        $member = $this->createUser($em, $this->uniqueEmail('msg_member'));
        $workspace = $this->createWorkspace($em, $owner, 'Messages WS');
        $workspace->addMember($member);
        $em->flush();

        // Le membre est explicitement ajoute au channel pour satisfaire CHANNEL_VIEW.
        $channel = $this->createChannel($em, $workspace, 'general', [$owner, $member]);
        $message = $this->createMessage($em, $channel, $member, 'hello world');

        // Ici on utilise un JWT reel car les routes messages sont stateless.
        $jwt = $this->issueJwt($client, $member);
        $client->request('GET', sprintf('/api/channels/%d/messages', $channel->getId()), [], [], $this->authHeaders($jwt));
        $this->assertResponseIsSuccessful();
        $list = $this->responseJson($client);
        $this->assertNotEmpty($list);
        $client->request(
            'GET',
            sprintf('/api/channels/%d/messages/%d', $channel->getId(), $message->getId()),
            [],
            [],
            $this->authHeaders($jwt)
        );
        $this->assertResponseIsSuccessful();
        $show = $this->responseJson($client);
        $this->assertSame('hello world', $show['content'] ?? null);
    }

    // Un membre du workspace non present dans le channel ne peut pas lire les messages.
    public function testWorkspaceMemberNotInChannelCannotListMessages(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('msg_owner2'));
        $channelMember = $this->createUser($em, $this->uniqueEmail('msg_channel_member2'));
        $workspaceOnlyMember = $this->createUser($em, $this->uniqueEmail('msg_workspace_member2'));

        $workspace = $this->createWorkspace($em, $owner, 'Messages WS 2');
        $workspace->addMember($channelMember);
        $workspace->addMember($workspaceOnlyMember);
        $em->flush();

        // L'utilisateur "workspaceOnlyMember" n'est volontairement PAS dans les membres du channel.
        $channel = $this->createChannel($em, $workspace, 'general', [$owner, $channelMember]);
        $this->createMessage($em, $channel, $channelMember, 'secret');
        $jwt = $this->issueJwt($client, $workspaceOnlyMember);
        $client->request('GET', sprintf('/api/channels/%d/messages', $channel->getId()), [], [], $this->authHeaders($jwt));
        $this->assertResponseStatusCodeSame(403);
    }

    // Seul l'auteur d'un message peut le modifier ou le supprimer.
    public function testNonAuthorCannotUpdateOrDeleteMessage(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('msg_owner3'));
        $author = $this->createUser($em, $this->uniqueEmail('msg_author3'));
        $other = $this->createUser($em, $this->uniqueEmail('msg_other3'));
        $workspace = $this->createWorkspace($em, $owner, 'Messages WS 3');
        $workspace->addMember($author);
        $workspace->addMember($other);
        $em->flush();
        $channel = $this->createChannel($em, $workspace, 'general', [$owner, $author, $other]);
        $message = $this->createMessage($em, $channel, $author, 'initial');

        // "other" a acces au channel, mais n'est pas l'auteur du message.
        $jwt = $this->issueJwt($client, $other);
        $uri = sprintf('/api/channels/%d/messages/%d', $channel->getId(), $message->getId());
        $client->request('PATCH', $uri, [], [], $this->authHeaders($jwt, true), json_encode(['content' => 'hacked']));
        $this->assertResponseStatusCodeSame(403);
        $client->request('DELETE', $uri, [], [], $this->authHeaders($jwt));
        $this->assertResponseStatusCodeSame(403);
    }

    // Le parcours complet auteur: update puis delete.
    public function testAuthorCanUpdateAndDeleteMessage(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('msg_owner4'));
        $author = $this->createUser($em, $this->uniqueEmail('msg_author4'));
        $workspace = $this->createWorkspace($em, $owner, 'Messages WS 4');
        $workspace->addMember($author);
        $em->flush();
        $channel = $this->createChannel($em, $workspace, 'general', [$owner, $author]);
        $message = $this->createMessage($em, $channel, $author, 'before');

        // L'auteur doit pouvoir enchaîner update puis delete sur son propre message.
        $jwt = $this->issueJwt($client, $author);
        $uri = sprintf('/api/channels/%d/messages/%d', $channel->getId(), $message->getId());
        $client->request('PATCH', $uri, [], [], $this->authHeaders($jwt, true), json_encode(['content' => 'after']));
        $this->assertResponseIsSuccessful();
        $json = $this->responseJson($client);
        $this->assertSame('after', $json['content'] ?? null);
        $client->request('DELETE', $uri, [], [], $this->authHeaders($jwt));
        $this->assertResponseStatusCodeSame(204);
    }
}

