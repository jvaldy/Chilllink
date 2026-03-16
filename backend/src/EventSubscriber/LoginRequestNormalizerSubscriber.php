<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class LoginRequestNormalizerSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 16],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        if (
            !$request->isMethod(Request::METHOD_POST)
            || '/api/login_check' !== $request->getPathInfo()
        ) {
            return;
        }

        if (
            !str_contains($request->getRequestFormat() ?? '', 'json')
            && !str_contains($request->getContentTypeFormat() ?? '', 'json')
        ) {
            return;
        }

        $content = $request->getContent();
        if ('' === $content) {
            return;
        }

        $data = json_decode($content, true);
        if (!is_array($data)) {
            return;
        }

        if (
            isset($data['email'])
            || !isset($data['username'])
            || !is_string($data['username'])
        ) {
            return;
        }

        $data['email'] = $data['username'];
        $requestFormat = $request->getRequestFormat(null);

        $request->initialize(
            $request->query->all(),
            $request->request->all(),
            $request->attributes->all(),
            $request->cookies->all(),
            $request->files->all(),
            $request->server->all(),
            json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
        );

        if (null !== $requestFormat) {
            $request->setRequestFormat($requestFormat);
        }
    }
}
