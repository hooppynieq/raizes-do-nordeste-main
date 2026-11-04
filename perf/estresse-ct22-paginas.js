import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
stages: [
  { duration: '1m',  target: 1500 },
  { duration: '1m',  target: 1500 },
  { duration: '30s', target: 300 },
  { duration: '1m',  target: 300 }
],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // meta de tempo de resposta (RQ-01)
    http_req_failed:   ['rate<0.01']    // menos de 1% de falhas
  }
};

// Páginas do fluxo do cliente
const paginas = [
  'index.html',
  'unidades.html',
  'cardapio.html',
  'carrinho.html',
  'pagamento.html'
];

export default function () {
  for (const pagina of paginas) {
    const res = http.get(`${__ENV.BASE_URL}/${pagina}`);

    check(res, {
      [`${pagina}: status 200`]: (r) => r.status === 200,
      [`${pagina}: contém HTML`]: (r) => r.body.includes('<title>')
    });

    sleep(1);   // pausa entre páginas, simulando a navegação do usuário
  }
}