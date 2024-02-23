use public;
SHOW tables;

SELECT * FROM categoria;
SELECT * FROM cliente;
SELECT * FROM endereco;
SELECT * FROM pedido;
SELECT * FROM produto;
SELECT * FROM produto_pedido;

--- Operações na table categoria
CREATE TABLE public.categoria (
	categoria_id serial NOT NULL,
	nome_categoria varchar(20) NULL,
	descricao_categoria varchar(200) NULL,
	CONSTRAINT categoria_pkey PRIMARY KEY (categoria_id)
);

INSERT INTO categoria (nome_categoria, descricao_categoria) VALUES ('Sabonete', 'Cheiroso e cremoso');
UPDATE categoria SET nome_categoria = 'Sabonetão', descricao_categoria = 'Sabonetoso' WHERE categoria_id = 4;


--- Operações na table cliente
CREATE TABLE public.cliente (
	cliente_id serial NOT NULL,
	email varchar(50) NULL,
	username varchar(15) NULL,
	senha varchar(20) NULL,
	nome varchar(200) NULL,
	cpf varchar(11) NOT NULL,
	telefone varchar(11) NULL,
	data_nascimento date NULL,
	endereco_id int4 NOT NULL,
	CONSTRAINT cliente_cpf_key UNIQUE (cpf),
	CONSTRAINT cliente_pkey PRIMARY KEY (cliente_id)
);

INSERT INTO public.cliente (email, username, senha, nome, cpf, telefone, data_nascimento, endereco_id)
VALUES ('cliente1@email.com', 'cliente1', 'senhaForte123', 'Cliente Um', '12345678900', '11912345678', '1990-01-01', 1);


-- Operações na tabela de endereco 

CREATE TABLE public.endereco (
	endereco_id serial NOT NULL,
	cep varchar(9) NULL,
	rua varchar(100) NULL,
	bairro varchar(30) NULL,
	cidade varchar(30) NULL,
	numero varchar(10) NULL,
	complemento varchar(100) NULL,
	uf varchar(2) NULL,
	CONSTRAINT endereco_pkey PRIMARY KEY (endereco_id)
);

INSERT INTO endereco(cep, rua, bairro, cidade, numero, complemento, uf) VALUES ('77777888', 'w1', 'Jd America', 'Rio de Fevereiro', '1', 'qd 1', 'RJ');


-- Operações na tabela de pedido

CREATE TABLE pedido (
    pedido_id int NOT NULL AUTO_INCREMENT,
    numero_pedido int,
    valor_total_pedido decimal,
    data_pedido date NOT NULL,
    status boolean,
    cliente_id int NOT NULL,
    PRIMARY KEY (pedido_id)
);

INSERT INTO pedido (numero_pedido, valor_total_pedido, data_pedido, status, cliente_id) VALUES ('1', '3', '2022/2/2', true, '1');

--- Operações na tabela de produto

CREATE TABLE produto (
    produto_id int NOT NULL AUTO_INCREMENT,
    nome_produto varchar(50),
    descricao_produto varchar(200),
    preco_produto decimal,
    qtd_estoque int,
    data_cadastro_produto date,
    categoria_id int NOT NULL,
    imagem varchar(255),
    PRIMARY KEY (produto_id)
);

insert into produto (nome_produto, descricao_produto, preco_produto, qtd_estoque, data_cadastro_produto, categoria_id, imagem) 
	VALUES ('eudora', 'perfume da eudora', 3, 3, '2010/2/1', 1, 'google');


--- Operações na tabela de produto_pedido

CREATE TABLE public.produto_pedido (
	produto_pedido_id serial NOT NULL,
	qtd_produto_pedido int4 NULL,
	preco_produto_pedido numeric NULL,
	produto_id int4 NULL,
	pedido_id int4 NULL,
	CONSTRAINT produto_pedido_pkey PRIMARY KEY (produto_pedido_id)
);

insert into produto_pedido (qtd_produto_pedido, preco_produto_pedido, produto_id, pedido_id)
	VALUES (2, 5, 1, 1)


ALTER TABLE public.produto_pedido ADD CONSTRAINT produto_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedido(pedido_id);
ALTER TABLE public.produto_pedido ADD CONSTRAINT produto_pedido_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produto(produto_id);

ALTER TABLE produto_pedido 
ADD CONSTRAINT produto_pedido_pedido_id_fkey 
FOREIGN KEY (pedido_id) REFERENCES pedido(pedido_id);

ALTER TABLE produto_pedido 
ADD CONSTRAINT produto_pedido_produto_id_fkey 
FOREIGN KEY (produto_id) REFERENCES produto(produto_id);
