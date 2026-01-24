<?php

namespace App\Service;

use App\Entity\Message;

class MessageNormalizer
{
    public static function normalize(Message $message): array
    {
        return [
            'id'        => $message->getId(),
            'content'   => $message->getContent(),
            'author'    => [
                'id'    => $message->getAuthor()->getId(),
                'email' => $message->getAuthor()->getEmail(),
            ],
            'channelId' => $message->getChannel()->getId(),
            'createdAt' => $message->getCreatedAt()?->format(DATE_ATOM),
        ];
    }
}
