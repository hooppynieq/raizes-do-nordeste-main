import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 500 },   // rampa
    { duration: '1m',  target: 500 },   // sustentado
    { duration: '10s', target: 0 }      // descida
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