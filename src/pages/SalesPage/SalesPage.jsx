import React from "react";
import { useEffect, useState } from "react";
import "./SalesPage.css";
import logo from "../../assets/logo.png";
import api from "../../services/api";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

  useEffect(() => {
    async function fetchSales() {
      try {
        const response = await api.get("/sales");
        setSales(response.data || []); // Garante que sales sempre será um array
      } catch (error) {
        console.error("Erro ao buscar vendas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, []);

  return (
    <div className="ContainerSales">
      <img src={logo} alt="Logo da marca" className="ImgSales" />
      <Typography
        style={{ color: "white", padding: "20px" }}
        variant="h4"
        gutterBottom
      >
        HISTÓRICO DE VENDAS
      </Typography>
      <div>
        <Tooltip
          title="Retornar ao caixa"
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
          <button
            className="Btn_Back"
            onClick={() => navigation("/caixamercadinho")}
          >
            <ArrowBackIcon sx={{ fontSize: "30px", justifyItems: "center" }} />
          </button>
        </Tooltip>
      </div>

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
                        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
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
  );
}
