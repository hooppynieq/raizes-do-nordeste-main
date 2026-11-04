const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/v1/pedidos') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      // Retorna o status 201 e o JSON exigido pelo check do k6 ({ status: 'PAGO' })
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'PAGO', message: 'Pedido processado com sucesso' }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Mock Server da API rodando em http://localhost:${PORT}`);
});