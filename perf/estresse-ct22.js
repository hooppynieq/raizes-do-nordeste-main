import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m',  target: 1500 },   // rampa até o estresse
    { duration: '1m',  target: 1500 },   // sustentado
    { duration: '30s', target: 300 },    // queda
    { duration: '1m',  target: 300 }     // recuperação
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed:   ['rate<0.01']
  },
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max']
};

export default function () {
  const corpo = JSON.stringify({
    unidadeId: 'boa-viagem',
    itens: [{ sku: 'rec-1', qtd: 1 }],
    pagamento: { metodo: 'pix' }
  });

  const res = http.post(`${__ENV.BASE_URL}/api/v1/pedidos`, corpo, {
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `${__VU}-${__ITER}` }
  });

  check(res, {
    'status 201': (r) => r.status === 201,
    'pedido pago': (r) => r.json('status') === 'PAGO'
  });
  sleep(1);
}