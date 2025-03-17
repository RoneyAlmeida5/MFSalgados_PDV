import "./CaixaMercadinho.css";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";

import { useState } from "react";
import logo from "../../assets/logo.png";

export default function CaixaMercadinho() {
  const [produtos, setProdutos] = useState([]);
  const [codigo, setCodigo] = useState("");
  const [produto, setProduto] = useState("");
  const [valor, setValor] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [adcProdOpen, setAdcProdOpen] = useState(false);
  const [listProdOpen, setListProdOpen] = useState(false);

  // ESTADOS DOS BOTÕES DO MODAL

  const handleOpenAdcProd = () => setAdcProdOpen(true);
  const handleCloseAdcProd = () => setAdcProdOpen(false);

  const handleOpenListProd = () => setListProdOpen(true);
  const handleCloseListProd = () => setListProdOpen(false);

  const adicionarProduto = () => {
    if (codigo && produto && valor) {
      setProdutos([...produtos, { codigo, produto, valor: parseFloat(valor) }]);
      setCodigo("");
      setProduto("");
      setValor("");
    }
  };

  const total = produtos.reduce((acc, item) => acc + item.valor, 0);

  return (
    <div className="ContainerMerc">
      <img src={logo} alt="Logo da marca" className="ImgMerc" />
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
          Lista de produtos
        </Button>
        <Modal open={adcProdOpen} onClose={handleCloseAdcProd}>
          <Box className="Box">
            <div className="ScreenModalAdcProd">
              <div className="PainelModalAdcProd">
                <h2>ADICIONAR PRODUTOS</h2>
                <input
                  className="InputModalAdcProd"
                  placeholder="Código"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
                <input
                  className="InputModalAdcProd"
                  placeholder="Produto"
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
                <button className="Btn" onClick={adicionarProduto}>
                  Adicionar
                </button>
              </div>
            </div>
          </Box>
        </Modal>
        <Modal open={listProdOpen} onClose={handleCloseListProd}>
          <Box className="Box">
            <div className="ScreenModalListProd">
              <div className="PainelModalListProd">
                <h2>PRODUTOS</h2>
                <div className="TableModalListProd">
                  <thead>
                    <tr className="Tr">
                      <th className="ThModelListProd">Código</th>
                      <th className="ThModelListProd">Produto</th>
                      <th className="ThModelListProd">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((item, index) => (
                      <tr className="Tr" key={index}>
                        <td className="TdCModelListProd">{item.codigo}</td>
                        <td className="TdModelListProd">{item.produto}</td>
                        <td className="TdModelListProd">
                          R$ {item.valor.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </div>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
      <div className="Screen">
        <div className="LeftPanel">
          <h2>"Até aqui o Senhor nos ajudou". 1 Samuel 7:12</h2>
          <div className="TableMerc">
            <thead>
              <tr className="Tr">
                <th className="Th">Código</th>
                <th className="Th">Produto</th>
                <th className="Th">Valor</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((item, index) => (
                <tr className="Tr" key={index}>
                  <td className="TdC">{item.codigo}</td>
                  <td className="Td">{item.produto}</td>
                  <td className="Td">R$ {item.valor.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </div>
          <div className="TotalMerc">
            <h3>Total: R$ {total.toFixed(2)}</h3>
          </div>
        </div>
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
          <button className="Btn" onClick={() => setProdutos([])}>
            Cancelar Venda
          </button>
        </div>
      </div>
    </div>
  );
}
