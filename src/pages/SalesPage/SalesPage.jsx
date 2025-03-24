import React from "react";
import { useEffect, useState } from "react";
import "./SalesPage.css";
import logo from "../../assets/logo.png";
import api from "../../services/api";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionIcon from "@mui/icons-material/Description";
import * as XLSX from "xlsx";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigate();

  // GERAR EXCEL
  const gerarExcel = () => {
    const data = sales.flatMap((sale) =>
      sale.salesProducts.map((item) => ({
        "ID da Venda": sale.id,
        Usuário: sale.user.name,
        Pagamento: sale.payment.name,
        Data: new Date(sale.date_sale).toLocaleDateString(),
        Produto: item.product.name,
        Quantidade: item.quantity,
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");
    XLSX.writeFile(workbook, "relatorio_vendas.xlsx");
  };

  // REALIZAR BUSCA DAS VENDAS
  useEffect(() => {
    async function fetchSales() {
      try {
        const response = await api.get("/sales");
        setSales(response.data || []); //Garante que sales sempre será um array
      } catch (error) {
        console.error("Erro ao buscar vendas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, []);

  return (
    // CONTAINER DA PAGINA
    <div className="ContainerSales">
      <img src={logo} alt="Logo da marca" className="ImgSales" />
      <Typography
        variant="h4"
        gutterBottom
        style={{
          color: "white",
          padding: "20px",
          fontFamily: "Montserrat, sans-serif", // Fonte moderna
          fontWeight: 400, // Peso da fonte leve
          letterSpacing: "0.1em", // Espaçamento entre letras
          textTransform: "uppercase", // Transformação do texto
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)", // Sombra do texto
        }}
      >
        Histórico de Vendas
      </Typography>
      {/*HEADER DOS BUTTON*/}
      <div className="ScrollContainerSales">
        <Tooltip
          title="Baixar planilha Excel"
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                fontSize: "1rem", // aumenta a fonte
                backgroundColor: "#333", // opcional
                color: "#fff", // opcional
              },
            },
          }}
        >
          <button className="Btn_Back" onClick={gerarExcel}>
            <DescriptionIcon
              sx={{ fontSize: "30px", justifyItems: "center" }}
            />
          </button>
        </Tooltip>
        <Tooltip
          title="Retornar ao caixa"
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                fontSize: "1rem", // aumenta a fonte
                backgroundColor: "#333", // opcional
                color: "#fff", // opcional
              },
            },
          }}
        >
          <button
            className="Btn_Back"
            onClick={() => navigation("/caixamercadinho")}
          >
            <ArrowBackIcon sx={{ fontSize: "30px", justifyItems: "center" }} />
          </button>
        </Tooltip>
      </div>
      {/*LOGICA TABELA VENDAS*/}
      <div>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <CircularProgress />
          </div>
        ) : sales.length === 0 ? (
          <Typography
            variant="h6"
            style={{ color: "white", textAlign: "center", marginTop: "20px" }}
          >
            Nenhuma venda encontrada.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: "90%",
              margin: "20px auto",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, #0e63ed 0%, #0134a0 50%, #00258a 100%)",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2);",
                  }}
                >
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    ID da Venda
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Usuário
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Pagamento
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Data
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Produto
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Quantidade
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale, index) => (
                  <React.Fragment key={sale.id}>
                    {sale.salesProducts.map((item, subIndex) => (
                      <TableRow
                        key={`${sale.id}-${subIndex}`}
                        sx={{
                          backgroundColor:
                            index % 2 === 0 ? "#0044ff56" : "white",
                        }}
                      >
                        <TableCell>{sale.id}</TableCell>
                        <TableCell>{sale.user.name}</TableCell>
                        <TableCell>{sale.payment.name}</TableCell>
                        <TableCell>
                          {new Date(sale.date_sale).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
}
