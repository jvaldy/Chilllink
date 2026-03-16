<?php

namespace App;

use App\DependencyInjection\Compiler\TestLoggingSilencerPass;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Compiler\PassConfig;
use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    protected function build(ContainerBuilder $container): void
    {
        parent::build($container);

        if ('test' === $this->environment) {
            $container->addCompilerPass(new TestLoggingSilencerPass(), PassConfig::TYPE_BEFORE_REMOVING, -1000);
        }
    }
}
