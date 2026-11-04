const assetImages = {
  recife: "assets/img/recife-boa-viagem.jpg",
  salvador: "assets/img/salvador-coastline.jpg",
  fortaleza: "assets/img/fortaleza-beira-mar.jpg",
  savory: "assets/img/cardapio-prato.jpg",
  dessert: "assets/img/cardapio-sobremesa.jpg",
  drink: "assets/img/cardapio-bebida.jpg",
  acaraje: "assets/img/acaraje.jpg",
  cartola: "assets/img/cartola-pernambucana-otimizada.jpg",
  dadinhos: "assets/img/dadinhos-tapioca-otimizada.jpg",
  baiao: "assets/img/baiao-de-dois.jpg",
  escondidinho: "assets/img/escondidinho-de-carne-seca.jpg",
  cocada: "assets/img/cocada-branca.jpg",
  pudim: "assets/img/pudim-de-tapioca.jpg"
};

window.RAIZES_MOCK = {
  channels: [
    { id: "web", label: "Web" },
    { id: "app", label: "App" },
    { id: "totem", label: "Totem" }
  ],
  serviceModes: [
    { id: "retirada", label: "Retirada" },
    { id: "delivery", label: "Delivery" },
    { id: "consumo-local", label: "Consumo no local" }
  ],
  units: [
    {
      id: "boa-viagem",
      name: "Recife - Boa Viagem",
      city: "Recife",
      neighborhood: "Boa Viagem",
      address: "Av. Conselheiro Aguiar, 1440",
      hours: "11h às 23h",
      eta: "20 a 30 min",
      deliveryFee: 7.9,
      rating: 4.8,
      status: "Aberta",
      image: assetImages.recife,
      channels: ["web", "app", "totem"],
      highlights: ["Cartola pernambucana", "Retirada expressa", "Promoção de almoço"]
    },
    {
      id: "rio-vermelho",
      name: "Salvador - Rio Vermelho",
      city: "Salvador",
      neighborhood: "Rio Vermelho",
      address: "Rua da Paciência, 67",
      hours: "11h às 23h30",
      eta: "25 a 35 min",
      deliveryFee: 8.9,
      rating: 4.9,
      status: "Aberta",
      image: assetImages.salvador,
      channels: ["web", "app", "totem"],
      highlights: ["Acarajé da casa", "Alta adesão no app", "Pontos em destaque"]
    },
    {
      id: "meireles",
      name: "Fortaleza - Meireles",
      city: "Fortaleza",
      neighborhood: "Meireles",
      address: "Av. Beira Mar, 2180",
      hours: "11h às 22h30",
      eta: "20 a 30 min",
      deliveryFee: 7.5,
      rating: 4.7,
      status: "Aberta",
      image: assetImages.fortaleza,
      channels: ["web", "app", "totem"],
      highlights: ["Baião e tapioca", "Retirada inteligente", "Sobremesas regionais"]
    }
  ],
  campaigns: [
    {
      id: "camp-1",
      title: "Almoço Raízes Recife",
      description: "10% de desconto em pedidos acima de R$ 50 na unidade de Recife.",
      unitId: "boa-viagem",
      image: assetImages.baiao,
      discountRate: 10,
      minimumOrder: 50
    },
    {
      id: "camp-2",
      title: "Dobro de pontos no App",
      description: "Pedidos feitos no canal App recebem pontos extras na unidade de Salvador.",
      unitId: "rio-vermelho",
      image: assetImages.acaraje,
      discountRate: 8,
      minimumOrder: 60
    },
    {
      id: "camp-3",
      title: "Combo Família do Sertão",
      description: "Desconto automático em pedidos acima de R$ 70 para toda a rede.",
      unitId: "all",
      image: assetImages.dessert,
      discountRate: 12,
      minimumOrder: 70
    }
  ],
  rewards: [
    {
      id: "reward-1",
      title: "Suco regional grátis",
      points: 60,
      description: "Resgate um suco de cajá, umbu ou graviola."
    },
    {
      id: "reward-2",
      title: "Sobremesa da casa",
      points: 120,
      description: "Escolha entre cartola, cocada cremosa ou pudim de tapioca."
    },
    {
      id: "reward-3",
      title: "Desconto de R$ 20",
      points: 180,
      description: "Cupom aplicado em pedidos acima de R$ 80."
    }
  ],
  users: [
    {
      id: "user-1",
      name: "Divonir Fagundes",
      email: "divonir@demo.com",
      phone: "(19) 99888-0001",
      password: "123456",
      preferredChannel: "app",
      goal: "delivery",
      marketing: true,
      role: "customer"
    },
    {
      id: "user-2",
      name: "Gestão Raízes",
      email: "admin@demo.com",
      phone: "(11) 90000-0000",
      password: "admin123",
      preferredChannel: "web",
      goal: "retirada",
      marketing: false,
      role: "admin"
    }
  ],
  menuItems: [
    {
      id: "rec-1",
      unitId: "boa-viagem",
      category: "Pratos principais",
      name: "Baião Cremoso Raízes",
      description: "Arroz, feijão verde, queijo coalho, nata da casa e carne de sol desfiada.",
      image: assetImages.baiao,
      price: 36.9,
      prepTime: "17 min",
      tags: ["Mais pedido", "Assinatura da marca"]
    },
    {
      id: "rec-2",
      unitId: "boa-viagem",
      category: "Combos",
      name: "Combo Recife Raízes",
      description: "Baião cremoso, dadinhos de tapioca e refresco natural da casa.",
      image: assetImages.baiao,
      price: 47.9,
      prepTime: "19 min",
      tags: ["Campanha ativa", "Almoço"]
    },
    {
      id: "rec-3",
      unitId: "boa-viagem",
      category: "Sobremesas",
      name: "Cartola com Doce de Leite",
      description: "Banana grelhada, queijo, canela e finalização cremosa da casa.",
      image: assetImages.cartola,
      price: 17.9,
      prepTime: "8 min",
      tags: ["Doce regional", "Queridinha"]
    },
    {
      id: "rec-4",
      unitId: "boa-viagem",
      category: "Bebidas",
      name: "Refresco de Cajá",
      description: "Bebida gelada, cítrica e natural, preparada na hora.",
      image: assetImages.drink,
      price: 10.9,
      prepTime: "5 min",
      tags: ["Natural", "Sem conservantes"]
    },
    {
      id: "sal-1",
      unitId: "rio-vermelho",
      category: "Pratos principais",
      name: "Acarajé Completo",
      description: "Bolinho de feijão fradinho com vatapá, camarão e salada fresca.",
      image: assetImages.acaraje,
      price: 31.9,
      prepTime: "15 min",
      tags: ["Tradicional", "Mais vendido no app"]
    },
    {
      id: "sal-2",
      unitId: "rio-vermelho",
      category: "Combos",
      name: "Combo Rio Vermelho",
      description: "Acarajé, cocada cremosa e refresco da casa em preço especial.",
      image: assetImages.acaraje,
      price: 44.9,
      prepTime: "18 min",
      tags: ["Dobro de pontos", "Combo"]
    },
    {
      id: "sal-3",
      unitId: "rio-vermelho",
      category: "Sobremesas",
      name: "Cocada Cremosa Premium",
      description: "Coco fresco, leite condensado e toque de canela finalizada na hora.",
      image: assetImages.cocada,
      price: 15.9,
      prepTime: "6 min",
      tags: ["Favorita", "Sobremesa da casa"]
    },
    {
      id: "sal-4",
      unitId: "rio-vermelho",
      category: "Bebidas",
      name: "Refresco de Tamarindo",
      description: "Bebida gelada com toque cítrico e final refrescante.",
      image: assetImages.drink,
      price: 11.9,
      prepTime: "4 min",
      tags: ["Refrescante", "Exclusiva"]
    },
    {
      id: "for-1",
      unitId: "meireles",
      category: "Pratos principais",
      name: "Escondidinho da Casa",
      description: "Purê de macaxeira gratinado, carne de sol e queijo coalho tostado.",
      image: assetImages.escondidinho,
      price: 35.9,
      prepTime: "17 min",
      tags: ["Campeão de vendas", "Forno"]
    },
    {
      id: "for-2",
      unitId: "meireles",
      category: "Combos",
      name: "Combo Família Fortaleza",
      description: "Escondidinho grande, dadinhos de tapioca e 2 bebidas regionais.",
      image: assetImages.escondidinho,
      price: 72.9,
      prepTime: "22 min",
      tags: ["Ideal para compartilhar", "Família"]
    },
    {
      id: "for-3",
      unitId: "meireles",
      category: "Acompanhamentos",
      name: "Dadinhos de Tapioca",
      description: "Cubos crocantes com geleia de pimenta agridoce servida à parte.",
      image: assetImages.dadinhos,
      price: 21.9,
      prepTime: "10 min",
      tags: ["Perfeito para dividir", "Vegetariano"]
    },
    {
      id: "for-4",
      unitId: "meireles",
      category: "Sobremesas",
      name: "Pudim de Tapioca",
      description: "Sobremesa gelada com coco ralado fresco e calda suave de baunilha.",
      image: assetImages.pudim,
      price: 16.9,
      prepTime: "7 min",
      tags: ["Doce regional", "Final perfeito"]
    }
  ],
  adminAlerts: [
    "Fila do totem abaixo de 5 minutos em Recife.",
    "Campanha do App com maior conversão em Salvador.",
    "Unidade de Fortaleza com melhor tempo médio de preparo."
  ]
};
