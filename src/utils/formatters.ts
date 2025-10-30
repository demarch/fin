/**
 * Formata um valor numérico como moeda brasileira (R$)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata uma data no padrão brasileiro (DD/MM/AAAA)
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

/**
 * Obtém o nome do mês em português
 */
export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex];
};

/**
 * Converte uma string de data "YYYY-MM" para um objeto Date
 */
export const parseMonthString = (monthStr: string): Date => {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month - 1, 1);
};

/**
 * Converte uma data para string no formato "YYYY-MM"
 */
export const formatMonthString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Parse de valor monetário brasileiro para número
 */
export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};
