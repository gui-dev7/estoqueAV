export const DEFAULTS = {
  "users": [
    {
      "id": "admin",
      "name": "Administrador",
      "email": "admin@avstorage.local",
      "role": "Administrador",
      "status": "active",
      "lastAccess": null,
      "isSystem": true,
      "isGuest": false
    },
    {
      "id": "dev.gui",
      "name": "Desenvolvedor",
      "email": "dev.gui@avstorage.local",
      "role": "Desenvolvedor",
      "status": "active",
      "lastAccess": null,
      "isSystem": true,
      "isGuest": false
    },
    {
      "id": "guest",
      "name": "Acesso rápido",
      "email": "guest@avstorage.local",
      "role": "Convidado",
      "status": "active",
      "lastAccess": null,
      "isSystem": true,
      "isGuest": true
    }
  ],
  "inventory": [
    {
      "id": "1",
      "name": "Cabo HDMI 2.0 5m",
      "category": "Cabos",
      "quantity": 45,
      "price": 35,
      "status": "ok",
      "manualPurchaseQty": 0,
      "deadline": null
    },
    {
      "id": "2",
      "name": "Microfone Sem Fio Duplo",
      "category": "Áudio",
      "quantity": 4,
      "price": 850,
      "status": "low",
      "manualPurchaseQty": 2,
      "deadline": "2026-04-01"
    },
    {
      "id": "3",
      "name": "Mesa de Som Analógica 12 Ch",
      "category": "Áudio",
      "quantity": 0,
      "price": 1600,
      "status": "zero",
      "manualPurchaseQty": 1,
      "deadline": "2026-03-25"
    },
    {
      "id": "4",
      "name": "Projetor Laser 5000 Lumens",
      "category": "Vídeo",
      "quantity": 2,
      "price": 14000,
      "status": "low",
      "manualPurchaseQty": 0,
      "deadline": null
    },
    {
      "id": "5",
      "name": "Refletor LED PAR 64",
      "category": "Luz",
      "quantity": 12,
      "price": 320,
      "status": "ok",
      "manualPurchaseQty": 0,
      "deadline": null
    },
    {
      "id": "6",
      "name": "Rolo Fita Gaffer Preta",
      "category": "Outros",
      "quantity": 15,
      "price": 85,
      "status": "ok",
      "manualPurchaseQty": 0,
      "deadline": null
    }
  ],
  "movements": [
    {
      "id": "m1",
      "itemId": "2",
      "type": "out",
      "quantity": 2,
      "date": "2026-03-25T13:08:42.721Z",
      "user": "Operador"
    },
    {
      "id": "m2",
      "itemId": "4",
      "type": "in",
      "quantity": 1,
      "date": "2026-03-25T12:08:42.721Z",
      "user": "Operador"
    },
    {
      "id": "m3",
      "itemId": "1",
      "type": "out",
      "quantity": 5,
      "date": "2026-03-24T14:08:42.721Z",
      "user": "Operador"
    }
  ],
  "infraRooms": [
    {
      "id": "u1-maker",
      "name": "Maker",
      "unit": 1,
      "floor": "Salas Especiais",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-quimica",
      "name": "Química",
      "unit": 1,
      "floor": "Salas Especiais",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-innovation",
      "name": "Innovation",
      "unit": 1,
      "floor": "Salas Especiais",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-devlab",
      "name": "Dev Lab",
      "unit": 1,
      "floor": "Salas Especiais",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-gamedev1",
      "name": "Game Dev1",
      "unit": 1,
      "floor": "Salas Especiais",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-ginastica",
      "name": "Ginástica",
      "unit": 1,
      "floor": "Salas Especiais",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-401",
      "name": "Sala 401",
      "unit": 1,
      "floor": "4º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-402",
      "name": "Sala 402",
      "unit": 1,
      "floor": "4º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-404",
      "name": "Sala 404",
      "unit": 1,
      "floor": "4º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-405",
      "name": "Sala 405",
      "unit": 1,
      "floor": "4º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-406",
      "name": "Sala 406",
      "unit": 1,
      "floor": "4º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-407",
      "name": "Sala 407",
      "unit": 1,
      "floor": "4º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-408",
      "name": "Sala 408",
      "unit": 1,
      "floor": "4º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-409",
      "name": "Sala 409",
      "unit": 1,
      "floor": "4º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-410",
      "name": "Sala 410",
      "unit": 1,
      "floor": "4º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-501",
      "name": "Sala 501",
      "unit": 1,
      "floor": "5º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-502",
      "name": "Sala 502",
      "unit": 1,
      "floor": "5º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-504",
      "name": "Sala 504",
      "unit": 1,
      "floor": "5º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-505",
      "name": "Sala 505",
      "unit": 1,
      "floor": "5º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-506",
      "name": "Sala 506",
      "unit": 1,
      "floor": "5º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-508",
      "name": "Sala 508",
      "unit": 1,
      "floor": "5º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-509",
      "name": "Sala 509",
      "unit": 1,
      "floor": "5º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-603",
      "name": "Sala 603",
      "unit": 1,
      "floor": "6º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-604",
      "name": "Sala 604",
      "unit": 1,
      "floor": "6º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-605",
      "name": "Sala 605",
      "unit": 1,
      "floor": "6º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-606",
      "name": "Sala 606",
      "unit": 1,
      "floor": "6º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-607",
      "name": "Sala 607",
      "unit": 1,
      "floor": "6º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-608",
      "name": "Sala 608",
      "unit": 1,
      "floor": "6º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-609",
      "name": "Sala 609",
      "unit": 1,
      "floor": "6º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-701",
      "name": "Sala 701",
      "unit": 1,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-702",
      "name": "Sala 702",
      "unit": 1,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-703",
      "name": "Sala 703",
      "unit": 1,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-704",
      "name": "Sala 704",
      "unit": 1,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-705",
      "name": "Sala 705",
      "unit": 1,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-706",
      "name": "Sala 706",
      "unit": 1,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-707",
      "name": "Sala 707",
      "unit": 1,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-708",
      "name": "Sala 708",
      "unit": 1,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-709",
      "name": "Sala 709",
      "unit": 1,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u1-710",
      "name": "Sala 710",
      "unit": 1,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-201",
      "name": "Sala 201",
      "unit": 2,
      "floor": "2º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-202",
      "name": "Sala 202",
      "unit": 2,
      "floor": "2º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-203",
      "name": "Sala 203",
      "unit": 2,
      "floor": "2º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-204",
      "name": "Sala 204",
      "unit": 2,
      "floor": "2º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-301",
      "name": "Sala 301",
      "unit": 2,
      "floor": "3º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-302",
      "name": "Sala 302",
      "unit": 2,
      "floor": "3º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-303",
      "name": "Sala 303",
      "unit": 2,
      "floor": "3º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-304",
      "name": "Sala 304",
      "unit": 2,
      "floor": "3º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-501",
      "name": "Sala 501",
      "unit": 2,
      "floor": "5º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-502",
      "name": "Sala 502",
      "unit": 2,
      "floor": "5º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-503",
      "name": "Sala 503",
      "unit": 2,
      "floor": "5º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-603",
      "name": "Sala 603",
      "unit": 2,
      "floor": "6º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-701",
      "name": "Sala 701",
      "unit": 2,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-702",
      "name": "Sala 702",
      "unit": 2,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-703",
      "name": "Sala 703",
      "unit": 2,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-704",
      "name": "Sala 704",
      "unit": 2,
      "floor": "7º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-801",
      "name": "Sala 801",
      "unit": 2,
      "floor": "8º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-802",
      "name": "Sala 802",
      "unit": 2,
      "floor": "8º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-803",
      "name": "Sala 803",
      "unit": 2,
      "floor": "8º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-804",
      "name": "Sala 804",
      "unit": 2,
      "floor": "8º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-901",
      "name": "Sala 901",
      "unit": 2,
      "floor": "9º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-902",
      "name": "Sala 902",
      "unit": 2,
      "floor": "9º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-903",
      "name": "Sala 903",
      "unit": 2,
      "floor": "9º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "u2-904",
      "name": "Sala 904",
      "unit": 2,
      "floor": "9º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-ss3",
      "name": "Terceiro Subsolo",
      "unit": 3,
      "floor": "Subsolo",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-container",
      "name": "Container",
      "unit": 3,
      "floor": "Externa",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-r1",
      "name": "Sala de Reunião 1",
      "unit": 3,
      "floor": "Salas de Reunião",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-r2",
      "name": "Sala de Reunião 2",
      "unit": 3,
      "floor": "Salas de Reunião",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-r3",
      "name": "Sala de Reunião 3",
      "unit": 3,
      "floor": "Salas de Reunião",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-r4",
      "name": "Sala de Reunião 4",
      "unit": 3,
      "floor": "Salas de Reunião",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-r5",
      "name": "Sala de Reunião 5",
      "unit": 3,
      "floor": "Salas de Reunião",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-r6",
      "name": "Sala de Reunião 6",
      "unit": 3,
      "floor": "Salas de Reunião",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-r7",
      "name": "Sala de Reunião 7",
      "unit": 3,
      "floor": "Salas de Reunião",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-r8",
      "name": "Sala de Reunião 8",
      "unit": 3,
      "floor": "Salas de Reunião",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-r9",
      "name": "Sala de Reunião 9",
      "unit": 3,
      "floor": "Salas de Reunião",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-r10",
      "name": "Sala de Reunião 10",
      "unit": 3,
      "floor": "Salas de Reunião",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-r11",
      "name": "Sala de Reunião 11",
      "unit": 3,
      "floor": "Salas de Reunião",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-rooftop",
      "name": "Rooftop",
      "unit": 3,
      "floor": "Cobertura",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-11",
      "name": "11º Andar",
      "unit": 3,
      "floor": "11º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-4",
      "name": "4º Andar",
      "unit": 3,
      "floor": "4º Andar",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-coord",
      "name": "Coordenação School",
      "unit": 3,
      "floor": "Administrativo",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    },
    {
      "id": "setor-help",
      "name": "Help Center",
      "unit": 3,
      "floor": "Administrativo",
      "equip": {
        "proj": "",
        "amp": "",
        "sender": "",
        "recv": "",
        "obs": "",
        "obsLevel": "ok"
      }
    }
  ],
  "settings": {
    "threshold": 5,
    "buyerEmail": "compras@suaempresa.com.br"
  }
};
