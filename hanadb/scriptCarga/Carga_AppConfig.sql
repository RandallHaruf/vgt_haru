-- Email que dispara notificações/alertas do sistema a usuários e administradores
upsert "VGT.APP_CONFIG"("chave", "valor") values('emailQueEnvia', 'vale.global.tax@tenti.com.br') where "chave" = 'emailQueEnvia';
upsert "VGT.APP_CONFIG"("chave", "valor") values('senhaEmailQueEnvia', '{"content":"232d7d79049d81600e92c52b86ae446240ed796a0af34b1659f016d4c94145f6a47ece7420969fa4c59fbcf4b3698c86a2ba9f66fedca272daaf5054b0a4ec308364c75c4201240f43ecb367d3d1be9c42ba3274a0d7fa4b0e26c6dd97a325460e2a5e7c","tag":{"type":"Buffer","data":[83,75,109,203,27,232,57,29,73,203,160,28,68,22,227,43]}}') where "chave" = 'senhaEmailQueEnvia';

/*
* Email que recebe notificações/alertas do sistema em caixa compartilhada para administradores da vale.
* DEV: flavia.rezende.portugal@vale.com
* PRD: vale.global.tax@vale.com
*/
/* OBS: PARA APLICAÇÃO TESTE NA WEBIDE UTILIZAR EMAIL PESSOAL */
upsert "VGT.APP_CONFIG"("chave", "valor") values('emailQueRecebe', 'substituir.email.ambiente.correto@email.com') where "chave" = 'emailQueRecebe';