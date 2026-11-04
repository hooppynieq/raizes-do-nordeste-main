import http from 'k6/http';
import { check, sleep } from 'k6';
 
export const options = {
  stages: [ { duration: '5m', target: 500 }, { duration: '15m', target: 500 }, { duration: '2m', target: 0 } ],
  thresholds: { http_req_duration: ['p(95)<2000'], http_req_failed: ['rate<0.01'] },
};
 
export default function () {
  const body = JSON.stringify({ unidadeId: 'REC-01', itens: [{ sku: 'TAPIOCA-QUEIJO', qtd: 2 }],
                                pagamento: { metodo: 'MOCK_APROVADO' } });
  const res = http.post(`${__ENV.BASE_URL}/api/v1/pedidos`, body, {
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `${__VU}-${__ITER}` } });
  check(res, { 'status 201': (r) => r.status === 201, 'pedido pago': (r) => r.json('status') === 'PAGO' });
  sleep(1);
}
