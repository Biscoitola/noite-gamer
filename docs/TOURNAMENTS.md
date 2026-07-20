# Torneios

O algoritmo de eliminacao simples recebe N participantes, calcula a proxima potencia de 2, distribui seeds, cria BYEs e avanca automaticamente quem enfrenta BYE.

Cada partida aponta para a proxima por `nextMatchId` e `nextSlot`. O registro de vencedor valida se os dois participantes estao definidos, impede vencedor externo a partida e bloqueia alteracoes quando a partida dependente ja possui resultado.
