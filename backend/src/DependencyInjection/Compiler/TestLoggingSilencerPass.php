<?php

namespace App\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class TestLoggingSilencerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        if ('test' !== $container->getParameter('kernel.environment')) {
            return;
        }

        if ($container->hasDefinition('exception_listener')) {
            // Stop logging expected HTTP exceptions (403/400) to stderr during PHPUnit.
            $container->getDefinition('exception_listener')->replaceArgument(1, null);
        }

        if ($container->hasDefinition('debug.error_handler_configurator')) {
            // Disable default PHP error/deprecation loggers for cleaner test output.
            $container->getDefinition('debug.error_handler_configurator')
                ->replaceArgument(0, null)
                ->replaceArgument(5, null);
        }
    }
}
