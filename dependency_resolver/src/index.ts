import Resolver from './resolver';

const resolver: Resolver = new Resolver();
resolver.resolve(['forecast_revenue']);

resolver.addDataNode('accuracy', ['forecasts', 'sales']);

resolver.resolve(['forecast_revenue', 'accuracy']);
