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
import CalculateIcon from "@mui/icons-material/Calculate";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CaixaMercadinho() {
  const navigation = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [caixaAberto, setCaixaAberto] = useState(false);
  // ADICIONAR PRODUTOS
  const [produto, setProduto] = useState("");
  const [produtoDuplicado, setProdutoDuplicado] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [adcProdOpen, setAdcProdOpen] = useState(false);
  const [produtosLista, setProdutosLista] = useState([]);
  const [listProdOpen, setListProdOpen] = useState(false);
  // EDITAR PRODUTOS
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  // LISTA DE COMPRAS POR UUID
  const [produtosCompra, setProdutosCompra] = useState([]);
  const [uuidSelecionado, setUuidSelecionado] = useState("");
  const [nameSelecionado, setNameSelecionado] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  // CALCULAR TROCO
  const [valorPago, setValorPago] = useState(0); // Valor pago pelo cliente
  const [troco, setTroco] = useState(0); // Troco a ser dado
  const [openTrocoModal, setOpenTrocoModal] = useState(false); // Controle de abertura do modal
  // FORMAS DE PAGAMENTO
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [formaPagamento, setFormaPagamento] = useState(null);
  // TOTAL DA COMPRA
  const [total, setTotal] = useState(0);
  const [quantidade, setQuantidade] = useState(1);

  // CAIXA ABERTO OU FECHADO
  useEffect(() => {
    // Atualiza o estado do caixa com base na presença de produtos no carrinho
    setCaixaAberto(produtosCompra.length > 0);
  }, [produtosCompra]);

  // MODAL ADICIONAR PRODUTOS & EDITAR PRODUTOS
  const handleOpenAdcProd = () => setAdcProdOpen(true);
  const handleCloseAdcProd = () => {
    setAdcProdOpen(false); // Fecha o modal
    setModoEdicao(false); // Reseta o modo de edição
    setIdEditando(null); // Limpa o produto sendo editado
  };
  const editarProduto = (produto) => {
    setIdEditando(produto.id); // Salva o UUID do produto para que possamos atualizar no backend
    setCodigo(produto.uuid); // Preenche os campos do modal com as informações do produto
    setProduto(produto.name);
    setDescricao(produto.description);
    setValor(produto.value);
    setModoEdicao(true); // Altera o estado para o modo de edição
    setAdcProdOpen(true); // Abre o modal de edição
  };
  const adicionarProduto = async () => {
    if (codigo && produto && valor) {
      setIsLoading(true);

      try {
        if (modoEdicao && idEditando) {
          // Edição
          const response = await api.put(`/products/${idEditando}`, {
            uuid: codigo,
            name: produto,
            description: descricao,
            value: parseFloat(valor),
          });

          const produtosAtualizados = produtosLista.map((p) =>
            p.id === idEditando ? response.data : p
          );
          setProdutosLista(produtosAtualizados);
          setModoEdicao(false);
          setIdEditando(null);

          toast.success("✏️ Produto editado com sucesso!", {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        } else {
          // Adição
          const response = await api.post("/products", {
            uuid: codigo,
            name: produto,
            description: descricao,
            value: parseFloat(valor),
          });

          setProdutosLista([...produtosLista, response.data]);

          toast.success("🛒 Produto adicionado com sucesso!", {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        }

        // Limpa o formulário
        setCodigo("");
        setProduto("");
        setValor("");
        setDescricao("");
        setAdcProdOpen(false);
      } catch (error) {
        toast.error("❌ Erro ao salvar produto!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // PRODUTO DUPLICADO (ERRO)
  useEffect(() => {
    const codigoDuplicado = produtosLista.some(
      (p) => p.uuid === codigo && (!modoEdicao || p.id !== idEditando)
    );
    setProdutoDuplicado(codigoDuplicado);
  }, [codigo, produtosLista, modoEdicao, idEditando]);

  // MODAL LISTA DE PRODUTOS
  const handleCloseListProd = () => setListProdOpen(false);
  const handleOpenListProd = () => {
    setListProdOpen(true);
  };
  useEffect(() => {
    const produtosSalvos = localStorage.getItem("produtosLista");
    if (produtosSalvos) {
      setProdutosLista(JSON.parse(produtosSalvos));
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

  // MODAL TROCO
  const handleOpenTrocoModal = () => {
    setOpenTrocoModal(true);
  };
  const handleCloseTrocoModal = () => {
    setTroco(0); // Zera o valor do troco ao fechar o modal
    setOpenTrocoModal(false);
  };
  const calcularTroco = () => {
    if (valorPago >= total) {
      setTroco(valorPago - total);
    } else {
      alert("O valor pago é menor que o total da compra.");
    }
  };

  // FUNÇÃO BUSCAR PRODUTOS PELO (UUID & NAME PRODUTO)
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
  const buscarProdutoPorUuid = (uuid) => {
    const produtoUuid = produtosLista.find(
      (produtoUuid) => produtoUuid.uuid === uuid
    );
    setProdutoSelecionado(produtoUuid || null);
  };
  const buscarProdutoPorName = (name) => {
    if (name) {
      const produto = produtosLista.find((produto) => produto.name === name);
      setProdutoSelecionado(produto || null);
    } else {
      setProdutoSelecionado(null);
    }
  };

  // FUNÇÃO ADICIONAR PRODUTOS AO CARRINHO
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

  // FUNÇÃO PARA DELETAR PRODUTO
  const removerProduto = async (idProduto) => {
    try {
      await api.delete(`/products/${idProduto}`); // <- Passe o id correto aqui

      const produtosAtualizados = produtosLista.filter(
        (produto) => produto.id !== idProduto
      );
      setProdutosLista(produtosAtualizados);

      localStorage.setItem(
        "produtosLista",
        JSON.stringify(produtosAtualizados)
      );
    } catch (error) {
      console.error("Erro ao remover produto:", error);
    }
  };

  // FUNÇÃO PARA DELETAR PRODUTO DO CARRINHO
  const removerProdutoDoCarrinho = (idProduto) => {
    const produtosAtualizados = produtosCompra.filter(
      (produto) => produto.uuid !== idProduto
    );
    setProdutosCompra(produtosAtualizados);
    localStorage.setItem("produtosCompra", JSON.stringify(produtosAtualizados));
  };

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

  // CANCELAR VENDA
  const cancelarVenda = () => {
    setProdutosCompra([]);
    localStorage.removeItem("produtosCompra");
    toast.success("🛒 Venda cancelada com sucesso!", {
      // Exibe o toast
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
  };

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

      const venda = {
        userId: user_id,
        paymentId: formaPagamento,
        produtos: produtosCompra.map((produto) => ({
          uuid: produto.uuid,
          quantity: produto.quantidade,
          value: parseFloat(produto.value),
        })),
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await api.post("/sales/createSales", venda, {
        // Alterar a rota para createSales
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("🛒 Venda finalizada com sucesso!", {
        position: "top-right",
        autoClose: 4000, // Fecha após 3 segundos
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

  return (
    <div className="ContainerMerc">
      <img src={logo} alt="Logo da marca" className="ImgMerc" />
      {/* MODAL SCROLL */}
      <div className="ScrollContainer">
        <Box className={`CardBox ${caixaAberto ? "Box_Open" : "Box_Close"}`}>
          {caixaAberto ? (
            <text className="TextBox">CAIXA ABERTO</text>
          ) : (
            <text className="TextBox">CAIXA FECHADO</text>
          )}
        </Box>
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
          <Tooltip
            title="Calcular troco"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  fontSize: "1rem",
                  backgroundColor: "#333",
                  color: "#fff",
                  padding: "8px 12px",
                },
              },
            }}
          >
            <Button
              sx={{
                padding: "9px",
                backgroundColor: "#00b11b",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.5s",
                "&:hover": {
                  backgroundColor: "#007e13",
                  transform: "translateY(0.6em)",
                },
              }}
              onClick={handleOpenTrocoModal}
            >
              <CalculateIcon
                sx={{ fontSize: "30px", justifyItems: "center" }}
              />
            </Button>
          </Tooltip>

          {/* Modal de Troco */}
          <Modal open={openTrocoModal} onClose={handleCloseTrocoModal}>
            <div className="BoxTroco">
              <div className="ScreenModalTroco">
                <div className="PainelModalTroco">
                  <h1>Valor Pago</h1>
                  <input
                    className="InputModalTroco"
                    type="number"
                    value={valorPago}
                    onChange={(e) => setValorPago(parseFloat(e.target.value))}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                  />
                  <Button
                    sx={{
                      padding: "10px",
                      backgroundColor: "#0e63ed",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                      "&:hover": {
                        backgroundColor: "#00258a",
                      },
                    }}
                    onClick={calcularTroco}
                  >
                    Calcular Troco
                  </Button>

                  {troco > 0 && (
                    <h3 style={{ marginTop: "10px" }}>
                      Troco:{" "}
                      <h1 style={{ color: "#00be43db", marginBottom: "-10px" }}>
                        R$ {troco.toFixed(2)}
                      </h1>
                    </h3>
                  )}

                  <Button
                    sx={{
                      padding: "10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                      marginTop: "10px",
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
                <h2>{modoEdicao ? "EDITAR PRODUTO" : "ADICIONAR PRODUTO"}</h2>
                <input
                  className="InputModalAdcProd"
                  placeholder="Código"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
                {produtoDuplicado && <p>ESTE CÓDIGO ESTÁ SENDO UTILIZADO.</p>}
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
                <button
                  className="Btn"
                  onClick={adicionarProduto}
                  disabled={produtoDuplicado || isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : modoEdicao ? (
                    "Salvar Edição"
                  ) : (
                    "Adicionar Produto"
                  )}
                </button>
              </div>
            </div>
          </Box>
        </Modal>
        {/* MODAL DE LISTA DE PRODUTOS */}
        <Modal open={listProdOpen} onClose={handleCloseListProd}>
          <Box className="Box_ListProd">
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
                      <th className="ThModelListProd_Edit">Editar</th>
                      <th className="ThModelListProd_Edit">Deletar</th>
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
                        {/*EDITAR PRODUTO*/}
                        <Tooltip
                          title="Editar produto"
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
                          <td className="TdModelListProd_Edit">
                            <button
                              className="Btn_Delete"
                              onClick={() => editarProduto(item)}
                            >
                              <EditIcon
                                sx={{
                                  color: "black",
                                  fontSize: "27px",
                                  justifyItems: "center",
                                }}
                              />
                            </button>
                          </td>
                        </Tooltip>
                        {/*EXCLUIR PRODUTO*/}
                        <Tooltip>
                          <td className="TdModelListProd_Edit">
                            <button
                              className="Btn_Delete"
                              onClick={() => removerProduto(item.id)}
                            >
                              <DeleteIcon
                                sx={{
                                  color: "red",
                                  fontSize: "30px",
                                  justifyItems: "center",
                                }}
                              />
                            </button>
                          </td>
                        </Tooltip>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
      {/* PAINEL CARRINHO DE COMPRAS (LEFTPAINEL) */}
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
                  <th className="Th_Delete">Deletar</th>
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
                    <td className="Td_Delete">
                      <button
                        className="Btn_Delete"
                        onClick={() => removerProdutoDoCarrinho(item.uuid)}
                      >
                        <DeleteIcon
                          sx={{
                            color: "red",
                            fontSize: "30px",
                            justifyItems: "center",
                          }}
                        />
                      </button>
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
        {/* PAINEL FINALIZAR VENDA (RIGHTPAINEL) */}
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
          <button className="Btn" onClick={cancelarVenda}>
            Cancelar Venda
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
