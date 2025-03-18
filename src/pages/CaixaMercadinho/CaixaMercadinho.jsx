import "./CaixaMercadinho.css";
import api from "../../services/api";
import { Modal, Box, Button } from "@mui/material";

import { useState } from "react";
import logo from "../../assets/logo.png";

export default function CaixaMercadinho() {
  const [produtosLista, setProdutosLista] = useState([]);
  const [listProdOpen, setListProdOpen] = useState(false);
  const [produto, setProduto] = useState("");
  const [codigo, setCodigo] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [adcProdOpen, setAdcProdOpen] = useState(false);

  // BUSCAR PRODUTOS NO BACK-END

  const buscarProdutos = async () => {
    try {
      const token = localStorage.getItem("token"); // Ou outra forma de obter o token
      const response = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${token}`, // Adiciona o token no cabeçalho
        },
      });
      console.log(response.data); // Verifique os dados aqui
      setProdutosLista(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const handleOpenListProd = () => {
    buscarProdutos();
    setListProdOpen(true);
  };

  const handleCloseListProd = () => setListProdOpen(false);

  // ESTADOS DOS BOTÕES DO MODAL

  const handleOpenAdcProd = () => setAdcProdOpen(true);
  const handleCloseAdcProd = () => setAdcProdOpen(false);

  const adicionarProduto = async () => {
    if (produto && valor && descricao) {
      try {
        const response = await api.post("/products", {
          name: produto,
          value: parseFloat(valor),
          description: descricao,
        });
        setProdutosLista([...produtosLista, response.data]); // Adiciona o produto retornado pela API
        setProduto("");
        setValor("");
        setDescricao("");
      } catch (error) {
        console.error("Erro ao adicionar produto:", error);
      }
    }
  };

  const total = produtosLista.reduce((acc, item) => acc + item.valor, 0);

  return (
    <div className="ContainerMerc">
      <img src={logo} alt="Logo da marca" className="ImgMerc" />
      {/* BOTÕES DO MODAL */}
      <div className="ScrollContainer">
        <Button
          sx={{
            padding: "12px",
            backgroundColor: "#0056b3",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            "&:hover": {
              backgroundColor: "#004199",
            },
          }}
          onClick={handleOpenAdcProd}
        >
          Adicionar produtos
        </Button>
        <div>
          <Button
            sx={{
              padding: "12px",
              backgroundColor: "#0056b3",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
              "&:hover": {
                backgroundColor: "#004199",
              },
            }}
            onClick={handleOpenListProd}
          >
            Listar Produtos
          </Button>
        </div>
        {/* MODAL DE ADICIONAR PRODUTOS */}
        <Modal open={adcProdOpen} onClose={handleCloseAdcProd}>
          <Box className="Box">
            <div className="ScreenModalAdcProd">
              <div className="PainelModalAdcProd">
                <h2>ADICIONAR PRODUTOS</h2>
                <input
                  className="InputModalAdcProd"
                  placeholder="Produtos"
                  value={produto}
                  onChange={(e) => setProduto(e.target.value)}
                />
                <input
                  className="InputModalAdcProd"
                  placeholder="Valor"
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
                <input
                  className="InputModalAdcProd"
                  placeholder="Descrição"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />

                <button className="Btn" onClick={adicionarProduto}>
                  Adicionar
                </button>
              </div>
            </div>
          </Box>
        </Modal>
        {/* MODAL DE LISTA DE PRODUTOS */}
        <Modal open={listProdOpen} onClose={handleCloseListProd}>
          <Box className="Box">
            <div className="ScreenModalListProd">
              <div className="PainelModalListProd">
                <h2>PRODUTOS</h2>
                <div className="TableModalListProd">
                  <thead>
                    <tr className="Tr">
                      <th className="ThModelListProd">Produto</th>
                      <th className="ThModelListProd">Valor</th>
                      <th className="ThModelListProd">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosLista.map((item, index) => (
                      <tr className="Tr" key={index}>
                        <td className="TdCModelListProd">{item.name}</td>{" "}
                        {/* Correção: item.name */}
                        <td className="TdModelListProd">
                          {item.value !== undefined
                            ? `R$ ${parseFloat(item.value).toFixed(2)}`
                            : "Valor Indisponível"}
                        </td>{" "}
                        {/* Correção: item.value e conversão para número */}
                        <td className="TdModelListProd">
                          {item.description}
                        </td>{" "}
                        {/* Adicionado item.description */}
                      </tr>
                    ))}
                  </tbody>
                </div>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
      {/* PAINEL DE PRODUTOS EM CAIXA ABERTO (LEFTPAINEL) */}
      <div className="Screen">
        <div className="LeftPanel">
          <h2>"Até aqui o Senhor nos ajudou". 1 Samuel 7:12</h2>
          <div className="TableMerc">
            <table>
              <thead>
                <tr className="Tr">
                  <th className="Th">Código</th>
                  <th className="Th">Produto</th>
                  <th className="Th">Valor</th>
                </tr>
              </thead>
              <tbody>
                {produtosLista.map((item, index) => (
                  <tr className="Tr" key={index}>
                    <td className="TdC">{item.name}</td>
                    <td className="Td">{item.value}</td>
                    <td className="Td">
                      {item.value !== undefined
                        ? `R$ ${parseFloat(item.value).toFixed(2)}`
                        : "Valor Indisponível"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="TotalMerc">
            <h3>Total: R$ {total.toFixed(2)}</h3>
          </div>
        </div>
        {/* PAINEL PARA ADICIONAR & FINALIZAR COMPRA EM CAIXA ABERTO (RIGHTPAINEL) */}
        <div className="RightPanel">
          <h2>Adicionar Produto</h2>
          <input
            className="InputMerc"
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <input
            className="InputMerc"
            placeholder="Produto"
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
          />
          <input
            className="InputMerc"
            placeholder="Valor"
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          <button className="Btn" onClick={adicionarProduto}>
            Adicionar
          </button>
          <h2>Forma de Pagamento</h2>
          <select
            className="SelectMerc"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
          >
            <option>Dinheiro</option>
            <option>Cartão</option>
            <option>PIX</option>
          </select>
          <button className="Btn" onClick={() => alert("Compra Finalizada!")}>
            Finalizar Venda
          </button>
          <button className="Btn" onClick={() => setProdutosLista([])}>
            Cancelar Venda
          </button>
        </div>
      </div>
    </div>
  );
}
