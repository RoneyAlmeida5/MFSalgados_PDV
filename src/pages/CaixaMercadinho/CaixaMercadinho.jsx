import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import logo from "../../assets/logo.png";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";
import "./CaixaMercadinho.css";

import { Modal, Box, Button, Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import ReceiptIcon from "@mui/icons-material/Receipt";

import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CaixaMercadinho() {
  const navigation = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  // CALCULAR TROCO
  const [valorPago, setValorPago] = useState(0); // Valor pago pelo cliente
  const [troco, setTroco] = useState(0); // Troco a ser dado
  const [openTrocoModal, setOpenTrocoModal] = useState(false); // Controle de abertura do modal
  // ADICIONAR PRODUTOS
  const [produto, setProduto] = useState("");
  const [codigo, setCodigo] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [adcProdOpen, setAdcProdOpen] = useState(false);
  const [produtosLista, setProdutosLista] = useState([]);
  const [listProdOpen, setListProdOpen] = useState(false);
  // LISTA DE COMPRAS POR UUID
  const [produtosCompra, setProdutosCompra] = useState([]);
  const [uuidSelecionado, setUuidSelecionado] = useState("");
  const [nameSelecionado, setNameSelecionado] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  // TOTAL DA COMPRA
  const [total, setTotal] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  // FORMAS DE PAGAMENTO
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [formaPagamento, setFormaPagamento] = useState(null);

  // FUNÇÃO PARA TROCO
  // ABRIR MODAL
  const handleOpenTrocoModal = () => {
    setOpenTrocoModal(true);
  };
  // FECHAR MODAL
  const handleCloseTrocoModal = () => {
    setTroco(0); // Zera o valor do troco ao fechar o modal
    setOpenTrocoModal(false);
  };
  // CALCULAR TROCO
  const calcularTroco = () => {
    if (valorPago >= total) {
      setTroco(valorPago - total);
    } else {
      alert("O valor pago é menor que o total da compra.");
    }
  };

  // FUNÇÃO BUSCAR PRODUTOS PELO (UUID)
  const buscarProdutoPorUuid = (uuid) => {
    const produtoUuid = produtosLista.find(
      (produtoUuid) => produtoUuid.uuid === uuid
    );
    setProdutoSelecionado(produtoUuid || null);
  };
  // FUNÇÃO BUSCAR PRODUTOS PELO (PRODUTO)
  const buscarProdutoPorName = (name) => {
    if (name) {
      const produto = produtosLista.find((produto) => produto.name === name);
      setProdutoSelecionado(produto || null);
    } else {
      setProdutoSelecionado(null);
    }
  };
  // FUNÇÃO ADICIONAR PRODUTOS A COMPRA
  const adicionarProdutoaCompra = () => {
    if (!produtoSelecionado) {
      alert("Selecione um produto antes de adicionar.");
      return;
    }

    const novoProdutoCompra = {
      ...produtoSelecionado,
      quantidade: quantidade,
    };

    setProdutosCompra([...produtosCompra, novoProdutoCompra]);
    setTotal(total + produtoSelecionado.value * quantidade); // Multiplica o valor pela quantidade
    setQuantidade(1);
  };

  // FUNÇÃO BUSCAR PRODUTOS NO BACK-END
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
    setListProdOpen(true);
  };

  useEffect(() => {
    const produtosSalvos = localStorage.getItem("produtosCompra");
    if (produtosSalvos) {
      setProdutosCompra(JSON.parse(produtosSalvos));
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(produtosCompra) && produtosCompra.length > 0) {
      localStorage.setItem("produtosCompra", JSON.stringify(produtosCompra));
    }
  }, [produtosCompra]);

  useEffect(() => {
    buscarProdutos();
  }, []);

  const handleCloseListProd = () => setListProdOpen(false);

  // FORMAS DE PAGAMENTOS
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get("/payments");
        setFormasPagamento(response.data);
        if (response.data.length > 0) {
          setFormaPagamento(response.data[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar formas de pagamento:", error);
      }
    };
    fetchPayments();
  }, []);
  // FUNÇÃO PARA FINALIZAR VENDA
  const finalizarVenda = async () => {
    setIsLoading(true); // Ativa o loading
    if (!formaPagamento || produtosCompra.length === 0) {
      alert("Selecione uma forma de pagamento e adicione produtos à compra.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const user = jwtDecode(token);
      const user_id = user.sub;

      console.log("ID extraído do token:", user_id);

      const venda = {
        userId: user_id,
        paymentId: formaPagamento,
        produtos: produtosCompra.map((produto) => ({
          uuid: produto.uuid,
          quantity: produto.quantidade,
          value: parseFloat(produto.value),
        })),
      };
      console.log("Enviando dados para o backend:", venda);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await api.post("/sales/createSales", venda, {
        // Alterar a rota para createSales
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("🛒 Venda finalizada com sucesso!", {
        position: "top-right",
        autoClose: 3000, // Fecha após 3 segundos
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      setProdutosCompra([]);
      localStorage.removeItem("produtosCompra");
      setTotal(0);
    } catch (error) {
      toast.error("❌ Erro ao finalizar a venda!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      alert("Erro ao finalizar venda. Tente novamente.");
    } finally {
      setIsLoading(false); // Desativa o loading
    }
  };

  // ESTADOS DOS BOTÕES DO MODAL

  const handleOpenAdcProd = () => setAdcProdOpen(true);
  const handleCloseAdcProd = () => setAdcProdOpen(false);

  const adicionarProduto = async () => {
    if (codigo && produto && valor) {
      try {
        const response = await api.post("/products", {
          uuid: codigo,
          name: produto,
          description: descricao,
          value: parseFloat(valor),
        });
        setProdutosLista([...produtosLista, response.data]); // Adiciona o produto retornado pela API
        setCodigo("");
        setProduto("");
        setValor("");
        setDescricao("");
      } catch (error) {
        console.error("Erro ao adicionar produto:", error);
      }
    }
  };

  // CALCULAR O TOTAL DA COMPRA
  const calcularTotal = useCallback(() => {
    return produtosCompra.reduce((total, produto) => {
      const valorNumerico = parseFloat(produto.value);
      return isNaN(valorNumerico)
        ? total
        : total + valorNumerico * produto.quantidade; // Multiplica o valor pela quantidade
    }, 0);
  }, [produtosCompra]);

  useEffect(() => {
    setTotal(calcularTotal());
  }, [produtosCompra, calcularTotal]);

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
        <div>
          {/* Botão para abrir o modal de troco */}
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
            onClick={handleOpenTrocoModal}
          >
            Calcular Troco
          </Button>

          {/* Modal de Troco */}
          <Modal
            sx={{ padding: 2, width: 400, margin: "auto", top: "30%" }}
            open={openTrocoModal}
            onClose={handleCloseTrocoModal}
          >
            <Box
              className="Box"
              sx={{ padding: 2, width: 400, margin: "auto", top: "20%" }}
            >
              <div className="ScreenModalTroco">
                <div className="PainelModalTroco">
                  <div>
                    <h1>Valor Pago</h1>
                    <input
                      className="InputModalTroco"
                      type="number"
                      value={valorPago}
                      onChange={(e) => setValorPago(parseFloat(e.target.value))}
                      fullWidth
                      sx={{ marginBottom: 2 }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "10px",
                      }}
                    >
                      <Button
                        sx={{
                          padding: "10px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          cursor: "pointer",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                          "&:hover": {
                            backgroundColor: "#218838",
                          },
                        }}
                        onClick={calcularTroco}
                      >
                        Calcular Troco
                      </Button>
                    </div>
                  </div>

                  {troco > 0 && (
                    <div style={{ marginTop: "10px" }}>
                      <h3>Troco: R$ {troco.toFixed(2)}</h3>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: "10px",
                    }}
                  >
                    <Button
                      sx={{
                        padding: "10px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                        "&:hover": {
                          backgroundColor: "#c82333",
                        },
                      }}
                      onClick={handleCloseTrocoModal}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </div>
            </Box>
          </Modal>
        </div>
        <div>
          <Tooltip
            title="Vendas"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  fontSize: "1rem", // aumenta a fonte
                  backgroundColor: "#333", // opcional
                  color: "#fff", // opcional
                  padding: "8px 12px", // mais espaço
                },
              },
            }}
          >
            <button className="Btn_Sales" onClick={() => navigation("/sales")}>
              <ReceiptIcon sx={{ fontSize: "30px", justifyItems: "center" }} />
            </button>
          </Tooltip>
        </div>
        {/* MODAL DE ADICIONAR PRODUTOS */}
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
                <table className="TableModalListProd">
                  <thead>
                    <tr className="Tr">
                      <th className="ThModelListProd">Código</th>
                      <th className="ThModelListProd">Produto</th>
                      <th className="ThModelListProd">Valor</th>
                      <th className="ThModelListProd">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosLista.map((item, index) => (
                      <tr className="Tr" key={index}>
                        <td className="TdCModelListProd">{item.uuid}</td>
                        <td className="TdModelListProd">{item.name}</td>
                        <td className="TdModelListProd">
                          {item.value !== undefined
                            ? `R$ ${parseFloat(item.value).toFixed(2)}`
                            : "Valor Indisponível"}
                        </td>
                        <td className="TdModelListProd">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <th className="Th">Quantidade</th>
                  <th className="Th">Valor</th>
                </tr>
              </thead>
              <tbody>
                {produtosCompra.map((item, index) => (
                  <tr className="Tr" key={index}>
                    <td className="TdC">{item.uuid}</td>
                    <td className="Td">{item.name}</td>
                    <td className="Td">{item.quantidade}</td>
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
            type="text"
            placeholder="Código"
            value={uuidSelecionado}
            onChange={(e) => {
              setUuidSelecionado(e.target.value);
              buscarProdutoPorUuid(e.target.value);
            }}
          />
          <input
            className="InputMerc"
            type="number" // Use type="number" para permitir apenas números
            placeholder="Quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)} // Garante que a quantidade seja um número inteiro
          />
          <Autocomplete
            options={produtosLista.map((produto) => produto.name)}
            value={nameSelecionado}
            onChange={(event, newValue) => {
              setNameSelecionado(newValue);
              buscarProdutoPorName(newValue);
            }}
            renderInput={(params) => <TextField {...params} label="Produto" />}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "48px",
              },
            }}
            className="InputMercProd"
          />
          <button className="Btn" onClick={adicionarProdutoaCompra}>
            Adicionar
          </button>
          <h2>Forma de Pagamento</h2>
          <select
            className="SelectMerc"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
          >
            {formasPagamento.map((forma) => (
              <option key={forma.id} value={forma.id}>
                {forma.name}
              </option>
            ))}
          </select>
          <button className="Btn" disabled={isLoading} onClick={finalizarVenda}>
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Finalizar Venda"
            )}
          </button>
          <button
            className="Btn"
            onClick={() => {
              setProdutosCompra([]);
              localStorage.removeItem("produtosCompra"); // Limpa os dados do localStorage
            }}
          >
            Cancelar Venda
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
